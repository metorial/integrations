import { ConnectClient } from './client';
import { onePasswordServiceError } from './errors';

type ConnectToolContext = {
  auth: {
    token: string;
    authType?: string;
  };
  config: {
    connectServerUrl?: string;
  };
};

export let createConnectClient = (ctx: ConnectToolContext) => {
  if (ctx.auth.authType !== 'connect') {
    throw onePasswordServiceError(
      'This tool requires the 1Password Connect Server Token auth method. Service Account and Events API tokens cannot call the Connect REST API.'
    );
  }

  if (!ctx.config.connectServerUrl) {
    throw onePasswordServiceError(
      'Connect server URL is required. Set connectServerUrl in the integration configuration.'
    );
  }

  return new ConnectClient({
    token: ctx.auth.token,
    serverUrl: ctx.config.connectServerUrl
  });
};
