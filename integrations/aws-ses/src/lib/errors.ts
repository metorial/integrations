import { badRequestError, ServiceError } from '@lowerdeck/error';

type ErrorResponse = {
  status?: number;
  statusText?: string;
  data?: unknown;
};

let isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

let pushDetail = (details: string[], value: unknown) => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return;
  }

  let detail = String(value).trim();
  if (detail && !details.includes(detail)) {
    details.push(detail);
  }
};

let collectDetails = (value: unknown, details: string[]) => {
  if (Array.isArray(value)) {
    for (let item of value) {
      collectDetails(item, details);
    }
    return;
  }

  if (!isRecord(value)) {
    pushDetail(details, value);
    return;
  }

  for (let key of [
    'message',
    'Message',
    'detail',
    'title',
    'error',
    'Error',
    'code',
    'Code',
    '__type'
  ]) {
    pushDetail(details, value[key]);
  }

  collectDetails(value.data, details);
  collectDetails(value.errors, details);
}

let extractAwsSesMessage = (error: unknown) => {
  let response = isRecord(error) ? (error.response as ErrorResponse | undefined) : undefined;
  let details: string[] = [];

  collectDetails(response?.data, details);

  if (details.length > 0) {
    return details.join(' - ');
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
};

let statusLabelFor = (response?: ErrorResponse) =>
  response?.status !== undefined
    ? `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}: `
    : '';

let upstreamCodeFor = (response?: ErrorResponse) => {
  if (!isRecord(response?.data)) {
    return undefined;
  }

  let code = response.data.Code ?? response.data.code ?? response.data.__type;
  return typeof code === 'string' ? code : undefined;
};

export let awsSesServiceError = (message: string) =>
  new ServiceError(badRequestError({ message }));

export let awsSesApiError = (error: unknown, operation = 'request') => {
  if (error instanceof ServiceError) {
    return error;
  }

  let response = isRecord(error) ? (error.response as ErrorResponse | undefined) : undefined;
  let serviceError = awsSesServiceError(
    `AWS SES API ${operation} failed: ${statusLabelFor(response)}${extractAwsSesMessage(error)}`
  );
  serviceError.data.reason = 'aws_ses_api_error';
  serviceError.data.upstreamStatus = response?.status;
  serviceError.data.upstreamCode = upstreamCodeFor(response);

  if (error instanceof Error) {
    serviceError.setParent(error);
  }

  return serviceError;
};

export let requireAwsSesString = (value: unknown, label: string, action?: string) => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  throw awsSesServiceError(`${label} is required${action ? ` for "${action}"` : ''}.`);
};

export let requireAwsSesArray = <T>(value: T[] | undefined, label: string, action?: string) => {
  if (Array.isArray(value) && value.length > 0) {
    return value;
  }

  throw awsSesServiceError(`${label} must contain at least one item${action ? ` for "${action}"` : ''}.`);
};
