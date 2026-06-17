import { badRequestError, forbiddenError, ServiceError } from '@lowerdeck/error';

type SlackServiceErrorOptions = {
  reason?: string;
  upstreamCode?: string;
  upstreamStatus?: number;
};

export let slackServiceError = (message: string, options: SlackServiceErrorOptions = {}) => {
  let error = new ServiceError(badRequestError({ message }));

  if (options.reason !== undefined) {
    error.data.reason = options.reason;
  }
  if (options.upstreamCode !== undefined) {
    error.data.upstreamCode = options.upstreamCode;
  }
  if (options.upstreamStatus !== undefined) {
    error.data.upstreamStatus = options.upstreamStatus;
  }

  return error;
};

export let slackApiError = (method: string, error?: string | null) =>
  slackServiceError(`Slack API error (${method}): ${error || 'Unknown error'}`, {
    reason: 'slack_api_error',
    upstreamCode: error || undefined
  });

export let slackOAuthError = (error?: string | null) =>
  slackServiceError(`Slack OAuth error: ${error || 'Unknown error'}`, {
    reason: 'slack_oauth_error',
    upstreamCode: error || undefined
  });

export let isSlackApiErrorCode = (error: unknown, code: string) =>
  error instanceof ServiceError && error.data.upstreamCode === code;

export let missingRequiredFieldError = (field: string, context?: string) => {
  let message = `${field} is required${context ? ` for ${context}` : ''}`;

  return slackServiceError(message);
};

export let missingRequiredAlternativeError = (message: string) => slackServiceError(message);

export let userTokenRequiredError = (message: string) =>
  new ServiceError(
    forbiddenError({
      message,
      reason: 'user_token_required'
    })
  );
