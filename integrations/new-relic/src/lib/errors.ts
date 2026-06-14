import { badRequestError, ServiceError } from '@lowerdeck/error';

type ErrorResponse = {
  status?: number;
  statusText?: string;
  data?: unknown;
};

let isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

let pushMessage = (messages: string[], value: unknown) => {
  if (typeof value !== 'string') return;

  let trimmed = value.trim();
  if (trimmed && !messages.includes(trimmed)) {
    messages.push(trimmed);
  }
};

let collectMessages = (value: unknown, messages: string[]) => {
  if (Array.isArray(value)) {
    for (let item of value) collectMessages(item, messages);
    return;
  }

  if (!isRecord(value)) {
    pushMessage(messages, value);
    return;
  }

  for (let key of ['message', 'description', 'details', 'error_description', 'error', 'type']) {
    pushMessage(messages, value[key]);
  }

  if (Array.isArray(value.errors)) {
    for (let error of value.errors) collectMessages(error, messages);
  }
};

let extractMessage = (error: unknown) => {
  let messages: string[] = [];
  let response = isRecord(error) ? (error.response as ErrorResponse | undefined) : undefined;
  collectMessages(response?.data ?? error, messages);

  if (messages.length > 0) return messages.join(' - ');
  if (error instanceof Error && error.message) return error.message;

  return 'Unknown error';
};

export let newRelicServiceError = (message: string) =>
  new ServiceError(badRequestError({ message }));

export let newRelicValidationError = (message: string) => newRelicServiceError(message);

export let newRelicApiError = (error: unknown, operation = 'request') => {
  if (error instanceof ServiceError) return error;

  let response = isRecord(error) ? (error.response as ErrorResponse | undefined) : undefined;
  let status = response?.status;
  let statusLabel =
    status !== undefined
      ? `HTTP ${status}${response?.statusText ? ` ${response.statusText}` : ''}: `
      : '';

  let serviceError = newRelicServiceError(
    `New Relic ${operation} failed: ${statusLabel}${extractMessage(error)}`
  );
  serviceError.data.reason = 'new_relic_api_error';
  serviceError.data.upstreamStatus = status;

  if (error instanceof Error) {
    serviceError.setParent(error);
  }

  return serviceError;
};

export let newRelicGraphqlErrors = (operation: string, errors: unknown[]) => {
  let message = extractMessage(errors);
  let serviceError = newRelicServiceError(`New Relic ${operation} failed: ${message}`);
  serviceError.data.reason = 'new_relic_graphql_error';
  return serviceError;
};
