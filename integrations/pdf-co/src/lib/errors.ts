import { badRequestError, ServiceError } from '@lowerdeck/error';

export let pdfCoServiceError = (message: string) =>
  new ServiceError(badRequestError({ message }));

export let pdfCoUpstreamError = (
  message: string,
  options: {
    reason?: string;
    status?: number | string;
    parent?: unknown;
  } = {}
) => {
  let error = pdfCoServiceError(message);
  error.data.reason = options.reason ?? 'pdfco_upstream_error';
  error.data.upstreamStatus = options.status;

  if (options.parent instanceof Error) {
    error.setParent(options.parent);
  }

  return error;
};

export let pdfCoApiError = (
  operation: string,
  response: {
    message?: string;
    status?: number | string;
  } = {}
) =>
  pdfCoUpstreamError(`${operation}: ${response.message || 'PDF.co reported an error.'}`, {
    status: response.status
  });

export let toPdfCoServiceError = (error: unknown, fallbackMessage: string) => {
  if (error instanceof ServiceError) {
    return error;
  }

  let maybeResponse = (error as any)?.response;
  let responseData = maybeResponse?.data;
  let message =
    responseData?.message ||
    responseData?.error ||
    (error instanceof Error ? error.message : undefined) ||
    fallbackMessage;

  return pdfCoUpstreamError(`${fallbackMessage}: ${message}`, {
    status: responseData?.status ?? maybeResponse?.status,
    parent: error
  });
};
