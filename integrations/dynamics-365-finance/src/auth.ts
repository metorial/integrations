import { normalizeFinOpsBaseUrl } from '@slates/dynamics-finops-recipes';
import {
  buildApiServiceError,
  createApiServiceError,
  createAxios,
  normalizeOAuthTokenResponse,
  requestAxiosData,
  SlateAuth
} from 'slates';
import { z } from 'zod';

let MICROSOFT_LOGIN_BASE = 'https://login.microsoftonline.com';
let DEFAULT_TENANT = 'organizations';
let USER_IMPERSONATION_SCOPE = 'user_impersonation';

type FinOpsOAuthInput = {
  tenantId?: string;
  environmentUrl: string;
};

type FinOpsAuthOutput = {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  tokenType?: string;
  tenantId?: string;
  environmentUrl: string;
  scopes?: string[];
};

type FinOpsOAuthAuthorizationContext = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  state: string;
  input: FinOpsOAuthInput;
};

type FinOpsOAuthCallbackContext = FinOpsOAuthAuthorizationContext & {
  code: string;
};

type FinOpsOAuthRefreshContext = {
  clientId: string;
  clientSecret: string;
  scopes: string[];
  input: FinOpsOAuthInput;
  output: FinOpsAuthOutput;
};

type FinOpsAuthProfileContext = {
  output: FinOpsAuthOutput;
};

type FinOpsClientCredentialsInput = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  environmentUrl: string;
};

type FinOpsClientCredentialsContext = {
  input: FinOpsClientCredentialsInput;
};

type MicrosoftTokenResponse = {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
  token_type?: unknown;
  scope?: unknown;
  id_token?: unknown;
};

let oauthInputSchema = z.object({
  environmentUrl: z
    .string()
    .describe(
      'Dynamics 365 Finance and Operations environment URL, for example https://contoso.operations.dynamics.com.'
    )
});

let oauthScopes = [
  {
    title: 'Finance and Operations User Impersonation',
    description: 'Access the selected Dynamics 365 Finance environment as the signed-in user.',
    scope: USER_IMPERSONATION_SCOPE
  },
  {
    title: 'Offline Access',
    description: 'Maintain access with refresh tokens.',
    scope: 'offline_access'
  },
  {
    title: 'OpenID',
    description: 'Request OpenID identity claims for profile metadata.',
    scope: 'openid'
  },
  {
    title: 'Profile',
    description: 'Request basic signed-in user profile claims.',
    scope: 'profile'
  },
  {
    title: 'Email',
    description: 'Request signed-in user email claims when available.',
    scope: 'email',
    defaultChecked: false
  }
];

let authServiceError = (message: string, reason = 'dynamics_finance_auth_error') =>
  createApiServiceError(message, {
    reason
  });

let microsoftAuthError = (error: unknown, operation = 'OAuth request') =>
  buildApiServiceError(error, {
    providerLabel: 'Microsoft Entra ID',
    reason: 'microsoft_entra_oauth_error',
    operation,
    detailKeys: ['error', 'error_description', 'message', 'trace_id', 'correlation_id'],
    nestedKeys: ['error', 'errors']
  });

let tokenHttp = (tenant: string) =>
  createAxios({
    baseURL: `${MICROSOFT_LOGIN_BASE}/${encodeURIComponent(tenant)}/oauth2/v2.0`
  });

let resolveTenant = (input: { tenantId?: string } | undefined) => {
  let tenant = input?.tenantId?.trim() || DEFAULT_TENANT;
  if (tenant.includes('/')) {
    throw authServiceError('Microsoft tenant ID cannot contain "/".');
  }

  return tenant;
};

let uniqueScopes = (scopes: string[]) => [...new Set(scopes.filter(Boolean))];

let scopeParam = (environmentUrl: string, scopes: string[]) => {
  let resource = normalizeFinOpsBaseUrl(environmentUrl);
  return uniqueScopes(scopes)
    .map(scope => (scope === USER_IMPERSONATION_SCOPE ? `${resource}/${scope}` : scope))
    .join(' ');
};

let parseGrantedScopes = (scope: unknown, fallback: string[]) => {
  if (Array.isArray(scope)) {
    return uniqueScopes(scope.filter((item): item is string => typeof item === 'string'));
  }

  if (typeof scope === 'string') {
    return uniqueScopes(scope.split(/\s+/g));
  }

  return uniqueScopes(fallback);
};

let decodeBase64Url = (value: string) => {
  let normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  let padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
};

let decodeJwtPayload = (token: string | undefined) => {
  if (!token) return {};
  let payload = token.split('.')[1];
  if (!payload) return {};

  try {
    let parsed = JSON.parse(decodeBase64Url(payload));
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

let stringClaim = (claims: Record<string, unknown>, ...keys: string[]) => {
  for (let key of keys) {
    let value = claims[key];
    if (typeof value === 'string' && value.trim()) return value;
  }

  return undefined;
};

let requestToken = async (
  tenant: string,
  operation: string,
  body: URLSearchParams
): Promise<MicrosoftTokenResponse> =>
  requestAxiosData<MicrosoftTokenResponse>(
    operation,
    () =>
      tokenHttp(tenant).post('/token', body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        }
      }),
    microsoftAuthError
  );

let normalizeDelegatedToken = (
  data: MicrosoftTokenResponse,
  options: {
    operation: string;
    requestedScopes: string[];
    previousRefreshToken?: string;
    tenant: string;
    environmentUrl: string;
  }
): FinOpsAuthOutput => {
  let normalized = normalizeOAuthTokenResponse(data, {
    providerLabel: 'Microsoft Entra ID',
    operation: options.operation,
    previousRefreshToken: options.previousRefreshToken,
    refreshTokenFallbackMode: 'falsy'
  });
  let claims = decodeJwtPayload(normalized.token);

  return {
    token: normalized.token,
    refreshToken: normalized.refreshToken,
    expiresAt: normalized.expiresAt,
    tokenType: typeof data.token_type === 'string' ? data.token_type : 'Bearer',
    tenantId: stringClaim(claims, 'tid') ?? options.tenant,
    environmentUrl: normalizeFinOpsBaseUrl(options.environmentUrl),
    scopes: parseGrantedScopes(data.scope, options.requestedScopes)
  };
};

let normalizeClientCredentialsToken = (
  data: MicrosoftTokenResponse,
  tenant: string,
  environmentUrl: string
): FinOpsAuthOutput => {
  if (typeof data.access_token !== 'string' || !data.access_token) {
    throw authServiceError('Microsoft Entra token response did not include an access token.');
  }

  let expiresAt =
    typeof data.expires_in === 'number'
      ? new Date(Date.now() + data.expires_in * 1000).toISOString()
      : undefined;

  return {
    token: data.access_token,
    expiresAt,
    tokenType: typeof data.token_type === 'string' ? data.token_type : 'Bearer',
    tenantId: tenant,
    environmentUrl: normalizeFinOpsBaseUrl(environmentUrl),
    scopes: parseGrantedScopes(data.scope, [
      `${normalizeFinOpsBaseUrl(environmentUrl)}/.default`
    ])
  };
};

let probeProfile = async (output: FinOpsAuthOutput) => {
  let environmentUrl = normalizeFinOpsBaseUrl(output.environmentUrl);
  let http = createAxios({
    baseURL: `${environmentUrl}/data`
  });

  await requestAxiosData<unknown>(
    'Dynamics 365 Finance profile probe',
    () =>
      http.get('/LegalEntities', {
        params: {
          $top: 1
        },
        headers: {
          Authorization: `Bearer ${output.token}`,
          Accept: 'application/json'
        }
      }),
    microsoftAuthError
  );

  let claims = decodeJwtPayload(output.token);
  let id =
    stringClaim(claims, 'oid', 'appid', 'azp', 'sub') ??
    output.tenantId ??
    'dynamics-365-finance-user';

  return {
    profile: {
      id,
      name: stringClaim(claims, 'name', 'appid'),
      email: stringClaim(claims, 'preferred_username', 'upn', 'email'),
      tenantId: stringClaim(claims, 'tid') ?? output.tenantId,
      environmentUrl
    }
  };
};

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional(),
      tokenType: z.string().optional(),
      tenantId: z.string().optional(),
      environmentUrl: z.string(),
      scopes: z.array(z.string()).optional()
    })
  )
  .addOauth<FinOpsOAuthInput>({
    type: 'auth.oauth',
    name: 'Work Only',
    key: 'oauth_organizations',
    inputSchema: oauthInputSchema,
    docs: [
      {
        type: 'docs.auth.oauth',
        name: 'Microsoft identity platform OAuth documentation',
        url: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow'
      },
      {
        type: 'docs.auth.oauth_scopes',
        name: 'Finance and Operations OData documentation',
        url: 'https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/data-entities/odata'
      }
    ],
    scopes: oauthScopes,

    getAuthorizationUrl: async (ctx: FinOpsOAuthAuthorizationContext) => {
      let tenant = resolveTenant(ctx.input);
      let environmentUrl = normalizeFinOpsBaseUrl(ctx.input.environmentUrl);
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        response_mode: 'query',
        scope: scopeParam(environmentUrl, ctx.scopes),
        state: ctx.state
      });

      return {
        url: `${MICROSOFT_LOGIN_BASE}/${encodeURIComponent(tenant)}/oauth2/v2.0/authorize?${params.toString()}`
      };
    },

    handleCallback: async (ctx: FinOpsOAuthCallbackContext) => {
      let tenant = resolveTenant(ctx.input);
      let environmentUrl = normalizeFinOpsBaseUrl(ctx.input.environmentUrl);
      let requestedScopes = uniqueScopes(ctx.scopes);
      let data = await requestToken(
        tenant,
        'Dynamics 365 Finance OAuth token exchange',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          code: ctx.code,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code',
          scope: scopeParam(environmentUrl, requestedScopes)
        })
      );

      return {
        output: normalizeDelegatedToken(data, {
          operation: 'token exchange',
          requestedScopes,
          tenant,
          environmentUrl
        })
      };
    },

    handleTokenRefresh: async (ctx: FinOpsOAuthRefreshContext) => {
      if (!ctx.output.refreshToken) {
        throw authServiceError(
          'No Microsoft refresh token is available. Reconnect Dynamics 365 Finance with offline_access enabled.',
          'oauth_refresh_token_missing'
        );
      }

      let tenant = resolveTenant({ tenantId: ctx.output.tenantId ?? ctx.input.tenantId });
      let environmentUrl = normalizeFinOpsBaseUrl(
        ctx.output.environmentUrl || ctx.input.environmentUrl
      );
      let requestedScopes = uniqueScopes(ctx.output.scopes ?? ctx.scopes);
      let data = await requestToken(
        tenant,
        'Dynamics 365 Finance OAuth token refresh',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.refreshToken,
          grant_type: 'refresh_token',
          scope: scopeParam(environmentUrl, requestedScopes)
        })
      );

      return {
        output: normalizeDelegatedToken(data, {
          operation: 'token refresh',
          requestedScopes,
          previousRefreshToken: ctx.output.refreshToken,
          tenant,
          environmentUrl
        })
      };
    },

    getProfile: async (ctx: FinOpsAuthProfileContext) => probeProfile(ctx.output)
  })
  .addCustomAuth({
    type: 'auth.custom',
    name: 'Client Credentials',
    key: 'client_credentials',
    inputSchema: z.object({
      tenantId: z.string().describe('Microsoft Entra tenant ID.'),
      clientId: z.string().describe('Application (client) ID from the app registration.'),
      clientSecret: z.string().describe('Client secret from the app registration.'),
      environmentUrl: z
        .string()
        .describe(
          'Dynamics 365 Finance and Operations environment URL, for example https://contoso.operations.dynamics.com.'
        )
    }),
    docs: [
      {
        type: 'docs.auth.oauth',
        name: 'Microsoft identity platform client credentials flow',
        url: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow'
      }
    ],

    getOutput: async (ctx: FinOpsClientCredentialsContext) => {
      let environmentUrl = normalizeFinOpsBaseUrl(ctx.input.environmentUrl);
      let tenant = resolveTenant({ tenantId: ctx.input.tenantId });
      let data = await requestToken(
        tenant,
        'Dynamics 365 Finance client credentials token exchange',
        new URLSearchParams({
          client_id: ctx.input.clientId,
          client_secret: ctx.input.clientSecret,
          grant_type: 'client_credentials',
          scope: `${environmentUrl}/.default`
        })
      );

      return {
        output: normalizeClientCredentialsToken(data, tenant, environmentUrl)
      };
    },

    getProfile: async (ctx: FinOpsAuthProfileContext) => probeProfile(ctx.output)
  });
