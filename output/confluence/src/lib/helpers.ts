import { ConfluenceClient, ConfluenceClientConfig } from './client';

export interface AuthOutput {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  cloudId?: string;
}

export interface ConfigOutput {
  cloudId?: string;
  baseUrl?: string;
}

export let createClient = (auth: AuthOutput, config: ConfigOutput): ConfluenceClient => {
  let cloudId = auth.cloudId || config.cloudId;
  let baseUrl = config.baseUrl;

  let authType: ConfluenceClientConfig['authType'];
  if (cloudId) {
    // OAuth Cloud or Basic Auth Cloud — check if it looks like a Base64 basic token
    // Basic auth tokens contain a colon when decoded (email:token)
    let isBasic = false;
    try {
      let decoded = atob(auth.token);
      if (decoded.includes(':')) {
        isBasic = true;
      }
    } catch {
      // Not valid base64, treat as bearer
    }
    authType = isBasic ? 'basic' : 'oauth';
  } else {
    authType = 'bearer';
  }

  return new ConfluenceClient({
    token: auth.token,
    cloudId,
    baseUrl,
    authType
  });
};
