import { createAxios, normalizeOAuthTokenResponse, requestAxiosData, SlateAuth } from 'slates';
import { z } from 'zod';
import { businessCentralApiError, businessCentralValidationError } from './lib/errors';

let MICROSOFT_LOGIN_BASE = 'https://login.microsoftonline.com';
let DEFAULT_TENANT = 'organizations';
let BUSINESS_CENTRAL_SCOPE =
  'https://api.businesscentral.dynamics.com/Financials.ReadWrite.All';

type BusinessCentralOAuthInput = {
  tenantId?: string;
};

type BusinessCentralAuthOutput = {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  tokenType?: string;
  tenantId?: string;
  scopes?: string[];
};

type BusinessCentralCallbackContext = {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
  input: BusinessCentralOAuthInput;
  scopes: string[];
};

type BusinessCentralRefreshContext = {
  clientId: string;
  clientSecret: string;
  input: BusinessCentralOAuthInput;
  output: BusinessCentralAuthOutput;
  scopes: string[];
};

type BusinessCentralProfileContext = {
  output: BusinessCentralAuthOutput;
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
  tenantId: z
    .string()
    .optional()
    .describe(
      'Microsoft Entra tenant authority for OAuth. Use "organizations", "common", or a tenant ID. Defaults to "organizations".'
    )
});

let oauthScopes = [
  {
    title: 'Business Central Read/Write Financials',
    description:
      'Delegated access to Dynamics 365 Business Central financial data through the official API.',
    scope: BUSINESS_CENTRAL_SCOPE
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

let tokenHttpCache = new Map<string, ReturnType<typeof createAxios>>();

let resolveTenant = (input: BusinessCentralOAuthInput | undefined) => {
  let tenant = input?.tenantId?.trim() || DEFAULT_TENANT;
  if (tenant.includes('/')) {
    throw businessCentralValidationError('Microsoft tenant ID cannot contain "/".');
  }

  return tenant;
};

let tokenHttp = (tenant: string) => {
  let cached = tokenHttpCache.get(tenant);
  if (cached) return cached;

  let client = createAxios({
    baseURL: `${MICROSOFT_LOGIN_BASE}/${encodeURIComponent(tenant)}/oauth2/v2.0`
  });
  tokenHttpCache.set(tenant, client);
  return client;
};

let uniqueScopes = (scopes: string[]) => [...new Set(scopes.filter(Boolean))];

let scopeParam = (scopes: string[]) => uniqueScopes(scopes).join(' ');

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

let normalizeToken = (
  data: MicrosoftTokenResponse,
  options: {
    operation: string;
    requestedScopes: string[];
    previousRefreshToken?: string;
    tenant: string;
  }
) => {
  let normalized = normalizeOAuthTokenResponse(data, {
    providerLabel: 'Microsoft',
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
    scopes: parseGrantedScopes(data.scope, options.requestedScopes)
  };
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
    businessCentralApiError
  );

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional(),
      tokenType: z.string().optional(),
      tenantId: z.string().optional(),
      scopes: z.array(z.string()).optional()
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'Microsoft Entra OAuth',
    key: 'oauth',
    inputSchema: oauthInputSchema,
    docs: [
      {
        type: 'docs.auth.oauth',
        name: 'Microsoft identity platform OAuth documentation',
        url: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow'
      },
      {
        type: 'docs.auth.oauth_scopes',
        name: 'Business Central connect apps documentation',
        url: 'https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-develop-connect-apps'
      }
    ],
    scopes: oauthScopes,

    getAuthorizationUrl: async ctx => {
      let tenant = resolveTenant(ctx.input);
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        response_mode: 'query',
        scope: scopeParam(ctx.scopes),
        state: ctx.state
      });

      return {
        url: `${MICROSOFT_LOGIN_BASE}/${encodeURIComponent(tenant)}/oauth2/v2.0/authorize?${params.toString()}`
      };
    },

    handleCallback: async (ctx: BusinessCentralCallbackContext) => {
      let tenant = resolveTenant(ctx.input);
      let requestedScopes = uniqueScopes(ctx.scopes);
      let data = await requestToken(
        tenant,
        'OAuth token exchange',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          code: ctx.code,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code',
          scope: scopeParam(requestedScopes)
        })
      );

      return {
        output: normalizeToken(data, {
          operation: 'token exchange',
          requestedScopes,
          tenant
        })
      };
    },

    handleTokenRefresh: async (ctx: BusinessCentralRefreshContext) => {
      if (!ctx.output.refreshToken) {
        throw businessCentralValidationError(
          'No Microsoft refresh token is available. Reconnect Business Central with offline_access enabled.',
          { reason: 'oauth_refresh_token_missing' }
        );
      }

      let tenant = resolveTenant(ctx.input);
      let requestedScopes = uniqueScopes(ctx.output.scopes ?? ctx.scopes);
      let data = await requestToken(
        tenant,
        'OAuth token refresh',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.refreshToken,
          grant_type: 'refresh_token',
          scope: scopeParam(requestedScopes)
        })
      );

      return {
        output: normalizeToken(data, {
          operation: 'token refresh',
          requestedScopes,
          previousRefreshToken: ctx.output.refreshToken,
          tenant
        })
      };
    },

    getProfile: async (ctx: BusinessCentralProfileContext) => {
      let claims = decodeJwtPayload(ctx.output.token);
      let id =
        stringClaim(claims, 'oid', 'sub') ??
        stringClaim(claims, 'tid') ??
        ctx.output.tenantId ??
        'business-central-user';

      return {
        profile: {
          id,
          name: stringClaim(claims, 'name'),
          email: stringClaim(claims, 'preferred_username', 'upn', 'email'),
          tenantId: stringClaim(claims, 'tid') ?? ctx.output.tenantId
        }
      };
    }
  });
