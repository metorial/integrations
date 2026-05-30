import { ServiceError, badRequestError } from '@lowerdeck/error';

export let sentryServiceError = (message: string) =>
  new ServiceError(badRequestError({ message }));
