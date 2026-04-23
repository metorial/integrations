import { createAxios } from 'slates';

type MicrosoftOauthScope = {
  title: string;
  description: string;
  scope: string;
};

type MicrosoftGraphOauthOptions = {
  name: string;
  key: string;
  tenant: string;
  scopes: MicrosoftOauthScope[];
  allowTenantInput?: boolean;
  missingRefreshTokenMessage?: string;
};

type MicrosoftGraphOauthInput = {
  tenantId?: unknown;
};

type MicrosoftGraphAuthorizationUrlContext = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  state: string;
  input?: MicrosoftGraphOauthInput;
};

type MicrosoftGraphCallbackContext = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  code: string;
  input?: MicrosoftGraphOauthInput;
};

type MicrosoftGraphTokenRefreshContext = {
  clientId: string;
  clientSecret: string;
  scopes: string[];
  input?: MicrosoftGraphOauthInput;
  output: {
    token: string;
    refreshToken?: string;
  };
};

type MicrosoftGraphProfileContext = {
  output: {
    token: string;
  };
};

type MicrosoftTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

let MICROSOFT_GRAPH_TEXT_LIKE_FILE_EXTENSIONS = new Set([
  '.txt',
  '.md',
  '.csv',
  '.json',
  '.xml',
  '.html',
  '.htm',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.css',
  '.svg',
  '.yaml',
  '.yml'
]);

let MICROSOFT_GRAPH_BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

let getMicrosoftTokenOutput = (
  data: MicrosoftTokenResponse,
  currentRefreshToken?: string
) => ({
  token: data.access_token,
  refreshToken: data.refresh_token ?? currentRefreshToken,
  expiresAt: data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000).toISOString()
    : undefined
});

let hasTextLikeFileExtension = (fileName: string) => {
  let dotIndex = fileName.lastIndexOf('.');
  return (
    dotIndex >= 0 &&
    MICROSOFT_GRAPH_TEXT_LIKE_FILE_EXTENSIONS.has(fileName.slice(dotIndex).toLowerCase())
  );
};

let isTextLikeContentType = (contentType?: string) => {
  if (!contentType) {
    return false;
  }

  let normalized = contentType.toLowerCase();
  if (normalized.includes('openxmlformats-officedocument')) {
    return false;
  }

  return (
    normalized.startsWith('text/') ||
    ['json', 'xml', 'javascript', 'typescript', 'svg', 'x-www-form-urlencoded'].some(
      fragment => normalized.includes(fragment)
    )
  );
};

let looksLikeBase64 = (content: string) => {
  let normalized = content.replace(/\s+/g, '');
  if (
    !normalized ||
    normalized.length % 4 !== 0 ||
    !MICROSOFT_GRAPH_BASE64_PATTERN.test(normalized)
  ) {
    return false;
  }

  try {
    return (
      Buffer.from(normalized, 'base64').toString('base64').replace(/=+$/g, '') ===
      normalized.replace(/=+$/g, '')
    );
  } catch {
    return false;
  }
};

export let MICROSOFT_OAUTH_INTEGRATION_KEYS = new Set([
  'azure-blob-storage',
  'azure-devops',
  'azure-functions',
  'azure-repos',
  'dynamics-365',
  'excel-online',
  'microsoft-teams',
  'onedrive',
  'onenote',
  'outlook',
  'power-bi',
  'powerpoint-online',
  'sharepoint',
  'superhuman-microsoft365',
  'word-online'
]);

export let usesMicrosoftOAuth = (integration: string) =>
  MICROSOFT_OAUTH_INTEGRATION_KEYS.has(integration);

export let normalizeMicrosoftRedirectUri = (redirectUri: string) => {
  let url = new URL(redirectUri);
  if (url.protocol === 'http:' && url.hostname === '127.0.0.1') {
    url.hostname = 'localhost';
  }

  return url.toString();
};

export let normalizeMicrosoftRedirectUriForIntegration = (
  integration: string,
  redirectUri: string
) =>
  usesMicrosoftOAuth(integration) ? normalizeMicrosoftRedirectUri(redirectUri) : redirectUri;

export let resolveMicrosoftTenant = (tenantId: unknown, defaultTenant: string) => {
  if (typeof tenantId !== 'string') {
    return defaultTenant;
  }

  let normalizedTenant = tenantId.trim();
  return normalizedTenant || defaultTenant;
};

export let buildMicrosoftGraphUploadBody = (
  fileName: string,
  content: string,
  contentType?: string
) => {
  if (
    isTextLikeContentType(contentType) ||
    hasTextLikeFileExtension(fileName) ||
    !looksLikeBase64(content)
  ) {
    return content;
  }

  return Buffer.from(content.replace(/\s+/g, ''), 'base64');
};

export let createMicrosoftGraphOauth = ({
  name,
  key,
  tenant,
  scopes,
  allowTenantInput = false,
  missingRefreshTokenMessage = 'No refresh token available. Ensure offline_access scope is requested.'
}: MicrosoftGraphOauthOptions) => {
  let graphAxios = createAxios({
    baseURL: 'https://graph.microsoft.com/v1.0'
  });

  let getTenant = (ctx: { input?: MicrosoftGraphOauthInput }) =>
    allowTenantInput ? resolveMicrosoftTenant(ctx.input?.tenantId, tenant) : tenant;

  let getTokenClient = (resolvedTenant: string) =>
    createAxios({
      baseURL: `https://login.microsoftonline.com/${resolvedTenant}/oauth2/v2.0`
    });

  return {
    type: 'auth.oauth' as const,
    name,
    key,
    scopes,

    getAuthorizationUrl: async (ctx: MicrosoftGraphAuthorizationUrlContext) => {
      let resolvedTenant = getTenant(ctx);
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        scope: ctx.scopes.join(' '),
        state: ctx.state,
        response_mode: 'query'
      });

      return {
        url: `https://login.microsoftonline.com/${resolvedTenant}/oauth2/v2.0/authorize?${params.toString()}`
      };
    },

    handleCallback: async (ctx: MicrosoftGraphCallbackContext) => {
      let tokenClient = getTokenClient(getTenant(ctx));
      let response = await tokenClient.post(
        '/token',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          code: ctx.code,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code',
          scope: ctx.scopes.join(' ')
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      return {
        output: getMicrosoftTokenOutput(response.data as MicrosoftTokenResponse)
      };
    },

    handleTokenRefresh: async (ctx: MicrosoftGraphTokenRefreshContext) => {
      if (!ctx.output.refreshToken) {
        throw new Error(missingRefreshTokenMessage);
      }

      let tokenClient = getTokenClient(getTenant(ctx));
      let response = await tokenClient.post(
        '/token',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.refreshToken,
          grant_type: 'refresh_token',
          scope: ctx.scopes.join(' ')
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      return {
        output: getMicrosoftTokenOutput(
          response.data as MicrosoftTokenResponse,
          ctx.output.refreshToken
        )
      };
    },

    getProfile: async (ctx: MicrosoftGraphProfileContext) => {
      let response = await graphAxios.get('/me', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let user = response.data as {
        id?: string;
        mail?: string;
        userPrincipalName?: string;
        displayName?: string;
      };

      return {
        profile: {
          id: user.id,
          email: user.mail || user.userPrincipalName,
          name: user.displayName
        }
      };
    }
  };
};
