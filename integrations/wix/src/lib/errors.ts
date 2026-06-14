import { badRequestError, ServiceError } from '@lowerdeck/error';

type ErrorResponse = {
  status?: number;
  statusText?: string;
  data?: unknown;
};

let isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

let pushDetail = (details: string[], value: unknown) => {
  if (typeof value !== 'string' && typeof value !== 'number') return;

  let detail = String(value).trim();
  if (detail && !details.includes(detail)) details.push(detail);
};

let collectDetails = (value: unknown, details: string[]) => {
  if (Array.isArray(value)) {
    for (let item of value) collectDetails(item, details);
    return;
  }

  if (!isRecord(value)) {
    pushDetail(details, value);
    return;
  }

  pushDetail(details, value.title);
  pushDetail(details, value.message);
  pushDetail(details, value.detail);
  pushDetail(details, value.error);
  pushDetail(details, value.code);
  collectDetails(value.details, details);
  collectDetails(value.errors, details);
};

let extractWixMessage = (error: unknown) => {
  let response = isRecord(error) ? (error.response as ErrorResponse | undefined) : undefined;
  let details: string[] = [];

  if (isRecord(response?.data)) {
    collectDetails(response.data.message, details);
    collectDetails(response.data.details, details);
    collectDetails(response.data.error, details);
    collectDetails(response.data.errors, details);
  } else {
    collectDetails(response?.data, details);
  }

  if (details.length > 0) return details.join(' - ');
  if (error instanceof Error && error.message) return error.message;
  return 'Unknown error';
};

export let wixServiceError = (message: string) =>
  new ServiceError(badRequestError({ message }));

export let wixApiError = (error: unknown, operation = 'request') => {
  if (error instanceof ServiceError) return error;

  let response = isRecord(error) ? (error.response as ErrorResponse | undefined) : undefined;
  let status = response?.status;
  let statusLabel =
    status !== undefined
      ? `HTTP ${status}${response?.statusText ? ` ${response.statusText}` : ''}: `
      : '';

  let serviceError = wixServiceError(
    `Wix API ${operation} failed: ${statusLabel}${extractWixMessage(error)}`
  );

  serviceError.data.reason = 'wix_api_error';
  serviceError.data.upstreamStatus = status;

  if (error instanceof Error) serviceError.setParent(error);

  return serviceError;
};
