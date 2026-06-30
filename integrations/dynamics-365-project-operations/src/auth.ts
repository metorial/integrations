import { normalizeFinOpsBaseUrl } from '@slates/dynamics-finops-recipes';
import {
  type DataverseRecord,
  normalizeDataverseInstanceUrl
} from '@slates/microsoft-dataverse-recipes';
import { createAxios, normalizeOAuthTokenResponse, requestAxiosData, SlateAuth } from 'slates';
import { z } from 'zod';
import { microsoftAuthApiError, projectOperationsValidationError } from './errors';

let MICROSOFT_LOGIN_BASE = 'https://login.microsoftonline.com';
let DEFAULT_TENANT = 'organizations';
let DISCOVERY_RESOURCE = 'https://globaldisco.crm.dynamics.com';
let DATAVERSE_DISCOVERY_SCOPE = `${DISCOVERY_RESOURCE}/user_impersonation`;

type ProjectOperationsOAuthInput = {
  tenantId?: string;
  dataverseInstanceUrl?: string;
  finOpsBaseUrl?: string;
};

type ProjectOperationsAuthOutput = {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  instanceUrl: string;
  tenantId?: string;
  scopes?: string[];
  finOpsToken?: string;
  finOpsExpiresAt?: string;
  finOpsBaseUrl?: string;
};

type OAuthCallbackContext = {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
  input: ProjectOperationsOAuthInput;
  scopes: string[];
};

type OAuthRefreshContext = {
  clientId: string;
  clientSecret: string;
  input: ProjectOperationsOAuthInput;
  output: ProjectOperationsAuthOutput;
  scopes: string[];
};

type ProfileContext = {
  output: ProjectOperationsAuthOutput;
};

type MicrosoftTokenResponse = {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
  token_type?: unknown;
  scope?: unknown;
};

type DataverseDiscoveryResponse = {
  value?: Array<{
    ApiUrl?: string;
    Url?: string;
    FriendlyName?: string;
  }>;
};
type DataverseDiscoveryInstance = NonNullable<DataverseDiscoveryResponse['value']>[number];

let oauthInputSchema = z.object({
  dataverseInstanceUrl: z
    .string()
    .optional()
    .describe(
      'Dataverse Project Operations environment URL. When omitted, the first environment from global discovery is used.'
    ),
  finOpsBaseUrl: z
    .string()
    .optional()
    .describe(
      'Finance and Operations environment URL. Provide this during connection if finance handoff tools will be used.'
    )
});

let oauthScopes = [
  {
    title: 'Dynamics 365 Dataverse Discovery',
    description:
      'Discover and access Dynamics 365 Dataverse environments as the signed-in user.',
    scope: DATAVERSE_DISCOVERY_SCOPE
  },
  {
    title: 'Offline Access',
    description: 'Maintain access with refresh tokens.',
    scope: 'offline_access'
  },
  {
    title: 'OpenID',
    description: 'Request OpenID identity claims for profile metadata.',
    scope: 'openid',
    defaultChecked: false
  },
  {
    title: 'Profile',
    description: 'Request basic signed-in user profile claims.',
    scope: 'profile',
    defaultChecked: false
  },
  {
    title: 'Email',
    description: 'Request signed-in user email claims when available.',
    scope: 'email',
    defaultChecked: false
  }
];

let tokenHttpCache = new Map<string, ReturnType<typeof createAxios>>();
let discoveryHttp = createAxios({ baseURL: DISCOVERY_RESOURCE });

let resolveTenant = (input: ProjectOperationsOAuthInput | undefined) => {
  let tenant = input?.tenantId?.trim() || DEFAULT_TENANT;
  if (tenant.includes('/')) {
    throw projectOperationsValidationError('Microsoft tenant ID cannot contain "/".');
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
let resourceDefaultScope = (resourceUrl: string) =>
  `${resourceUrl.replace(/\/+$/, '')}/.default`;

let parseGrantedScopes = (scope: unknown, fallback: string[]) => {
  if (Array.isArray(scope)) {
    return uniqueScopes(scope.filter((item): item is string => typeof item === 'string'));
  }

  if (typeof scope === 'string') {
    return uniqueScopes(scope.split(/\s+/g));
  }

  return uniqueScopes(fallback);
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
    microsoftAuthApiError
  );

let normalizeMicrosoftToken = (
  data: MicrosoftTokenResponse,
  options: {
    operation: string;
    requestedScopes: string[];
    previousRefreshToken?: string;
  }
) => {
  let normalized = normalizeOAuthTokenResponse(data, {
    providerLabel: 'Microsoft',
    operation: options.operation,
    previousRefreshToken: options.previousRefreshToken,
    refreshTokenFallbackMode: 'falsy'
  });

  return {
    token: normalized.token,
    refreshToken: normalized.refreshToken,
    expiresAt: normalized.expiresAt,
    scopes: parseGrantedScopes(data.scope, options.requestedScopes)
  };
};

export let normalizeDiscoveredDataverseInstanceUrl = (
  instance: DataverseDiscoveryInstance
) => {
  let apiUrl = typeof instance.ApiUrl === 'string' ? instance.ApiUrl.trim() : '';
  if (apiUrl) {
    return normalizeDataverseInstanceUrl(apiUrl);
  }

  let appUrl = typeof instance.Url === 'string' ? instance.Url.trim() : '';
  if (!appUrl) return undefined;

  try {
    let url = new URL(appUrl);
    url.pathname = '';
    url.search = '';
    url.hash = '';
    return normalizeDataverseInstanceUrl(url.toString());
  } catch {
    return normalizeDataverseInstanceUrl(appUrl);
  }
};

let discoverDataverseInstanceUrl = async (token: string) => {
  let data = await requestAxiosData<DataverseDiscoveryResponse>(
    'Dataverse environment discovery',
    () =>
      discoveryHttp.get('/api/discovery/v2.0/Instances', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }),
    microsoftAuthApiError
  );
  let instances = data.value ?? [];
  let instanceUrl = instances
    .map(instance => normalizeDiscoveredDataverseInstanceUrl(instance))
    .find((url): url is string => typeof url === 'string' && url.trim() !== '');

  if (!instanceUrl) {
    throw projectOperationsValidationError(
      'No Dynamics 365 Dataverse environments were found for this account.'
    );
  }

  return instanceUrl;
};

let exchangeRefreshTokenForResource = async (params: {
  tenant: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  resourceUrl: string;
  operation: string;
  previousRefreshToken?: string;
}) => {
  let requestedScopes = [resourceDefaultScope(params.resourceUrl)];
  let data = await requestToken(
    params.tenant,
    params.operation,
    new URLSearchParams({
      client_id: params.clientId,
      client_secret: params.clientSecret,
      refresh_token: params.refreshToken,
      grant_type: 'refresh_token',
      scope: scopeParam(requestedScopes)
    })
  );

  return normalizeMicrosoftToken(data, {
    operation: params.operation,
    requestedScopes,
    previousRefreshToken: params.previousRefreshToken ?? params.refreshToken
  });
};

let getDataverseSystemUserProfile = async (output: ProjectOperationsAuthOutput) => {
  let instanceUrl = normalizeDataverseInstanceUrl(output.instanceUrl);
  let api = createAxios({ baseURL: `${instanceUrl}/api/data/v9.2` });
  let whoAmI = await requestAxiosData<DataverseRecord>(
    'Dataverse WhoAmI',
    () =>
      api.get('/WhoAmI', {
        headers: {
          Authorization: `Bearer ${output.token}`
        }
      }),
    microsoftAuthApiError
  );
  let userId = typeof whoAmI.UserId === 'string' ? whoAmI.UserId : undefined;

  if (!userId) {
    return {
      profile: {
        id: output.tenantId ?? instanceUrl,
        name: 'Dynamics 365 Project Operations user'
      }
    };
  }

  let user = await requestAxiosData<DataverseRecord>(
    'Dataverse system user profile',
    () =>
      api.get(
        `/systemusers(${encodeURIComponent(userId)})?$select=fullname,internalemailaddress,systemuserid`,
        {
          headers: {
            Authorization: `Bearer ${output.token}`
          }
        }
      ),
    microsoftAuthApiError
  );

  return {
    profile: {
      id: typeof user.systemuserid === 'string' ? user.systemuserid : userId,
      name: typeof user.fullname === 'string' ? user.fullname : undefined,
      email:
        typeof user.internalemailaddress === 'string' ? user.internalemailaddress : undefined,
      tenantId: output.tenantId,
      instanceUrl
    }
  };
};

let outputSchema = z.object({
  token: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().optional(),
  instanceUrl: z.string(),
  tenantId: z.string().optional(),
  scopes: z.array(z.string()).optional(),
  finOpsToken: z.string().optional(),
  finOpsExpiresAt: z.string().optional(),
  finOpsBaseUrl: z.string().optional()
});

export let auth = SlateAuth.create()
  .output(outputSchema)
  .addOauth({
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
        name: 'Dynamics 365 authentication documentation',
        url: 'https://learn.microsoft.com/en-us/power-apps/developer/data-platform/authenticate-oauth'
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

    handleCallback: async (ctx: OAuthCallbackContext) => {
      let tenant = resolveTenant(ctx.input);
      let requestedScopes = uniqueScopes(ctx.scopes);
      let discoveryData = await requestToken(
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
      let discoveryToken = normalizeMicrosoftToken(discoveryData, {
        operation: 'token exchange',
        requestedScopes
      });

      if (!discoveryToken.refreshToken) {
        throw projectOperationsValidationError(
          'No Microsoft refresh token was returned. Reconnect with offline_access enabled.',
          { reason: 'oauth_refresh_token_missing' }
        );
      }

      let instanceUrl = ctx.input.dataverseInstanceUrl
        ? normalizeDataverseInstanceUrl(ctx.input.dataverseInstanceUrl)
        : await discoverDataverseInstanceUrl(discoveryToken.token);
      let dataverseToken = await exchangeRefreshTokenForResource({
        tenant,
        clientId: ctx.clientId,
        clientSecret: ctx.clientSecret,
        refreshToken: discoveryToken.refreshToken,
        previousRefreshToken: discoveryToken.refreshToken,
        resourceUrl: instanceUrl,
        operation: 'Dataverse resource token exchange'
      });
      let finalRefreshToken = dataverseToken.refreshToken ?? discoveryToken.refreshToken;
      let finOpsBaseUrl = ctx.input.finOpsBaseUrl
        ? normalizeFinOpsBaseUrl(ctx.input.finOpsBaseUrl)
        : undefined;
      let finOpsToken:
        | {
            token: string;
            refreshToken?: string;
            expiresAt?: string;
          }
        | undefined;

      if (finOpsBaseUrl) {
        finOpsToken = await exchangeRefreshTokenForResource({
          tenant,
          clientId: ctx.clientId,
          clientSecret: ctx.clientSecret,
          refreshToken: finalRefreshToken,
          previousRefreshToken: finalRefreshToken,
          resourceUrl: finOpsBaseUrl,
          operation: 'Finance and Operations resource token exchange'
        });
        finalRefreshToken = finOpsToken.refreshToken ?? finalRefreshToken;
      }

      return {
        output: {
          token: dataverseToken.token,
          refreshToken: finalRefreshToken,
          expiresAt: dataverseToken.expiresAt,
          instanceUrl,
          tenantId: tenant,
          scopes: discoveryToken.scopes,
          finOpsToken: finOpsToken?.token,
          finOpsExpiresAt: finOpsToken?.expiresAt,
          finOpsBaseUrl
        }
      };
    },

    handleTokenRefresh: async (ctx: OAuthRefreshContext) => {
      if (!ctx.output.refreshToken) {
        throw projectOperationsValidationError(
          'No Microsoft refresh token is available. Reconnect Project Operations with offline_access enabled.',
          { reason: 'oauth_refresh_token_missing' }
        );
      }

      let tenant = resolveTenant(ctx.input);
      let instanceUrl = normalizeDataverseInstanceUrl(ctx.output.instanceUrl);
      let dataverseToken = await exchangeRefreshTokenForResource({
        tenant,
        clientId: ctx.clientId,
        clientSecret: ctx.clientSecret,
        refreshToken: ctx.output.refreshToken,
        previousRefreshToken: ctx.output.refreshToken,
        resourceUrl: instanceUrl,
        operation: 'Dataverse token refresh'
      });
      let finalRefreshToken = dataverseToken.refreshToken ?? ctx.output.refreshToken;
      let finOpsBaseUrl =
        ctx.output.finOpsBaseUrl ??
        (ctx.input.finOpsBaseUrl
          ? normalizeFinOpsBaseUrl(ctx.input.finOpsBaseUrl)
          : undefined);
      let finOpsToken:
        | {
            token: string;
            refreshToken?: string;
            expiresAt?: string;
          }
        | undefined;

      if (finOpsBaseUrl) {
        finOpsToken = await exchangeRefreshTokenForResource({
          tenant,
          clientId: ctx.clientId,
          clientSecret: ctx.clientSecret,
          refreshToken: finalRefreshToken,
          previousRefreshToken: finalRefreshToken,
          resourceUrl: finOpsBaseUrl,
          operation: 'Finance and Operations token refresh'
        });
        finalRefreshToken = finOpsToken.refreshToken ?? finalRefreshToken;
      }

      return {
        output: {
          ...ctx.output,
          token: dataverseToken.token,
          refreshToken: finalRefreshToken,
          expiresAt: dataverseToken.expiresAt,
          instanceUrl,
          tenantId: ctx.output.tenantId ?? tenant,
          finOpsToken: finOpsToken?.token ?? ctx.output.finOpsToken,
          finOpsExpiresAt: finOpsToken?.expiresAt ?? ctx.output.finOpsExpiresAt,
          finOpsBaseUrl
        }
      };
    },

    getProfile: async (ctx: ProfileContext) => getDataverseSystemUserProfile(ctx.output)
  })
  .addCustomAuth({
    type: 'auth.custom',
    name: 'Client Credentials',
    key: 'client_credentials',
    inputSchema: z.object({
      tenantId: z.string().describe('Microsoft Entra tenant ID.'),
      clientId: z.string().describe('Application (client) ID from the app registration.'),
      clientSecret: z.string().describe('Client secret from the app registration.'),
      dataverseInstanceUrl: z
        .string()
        .describe('Dataverse Project Operations environment URL.'),
      finOpsBaseUrl: z
        .string()
        .optional()
        .describe('Finance and Operations environment URL for finance handoff tools.')
    }),

    getOutput: async ctx => {
      let instanceUrl = normalizeDataverseInstanceUrl(ctx.input.dataverseInstanceUrl);
      let dataverseScopes = [resourceDefaultScope(instanceUrl)];
      let dataverseData = await requestToken(
        ctx.input.tenantId,
        'Dataverse client credentials token exchange',
        new URLSearchParams({
          client_id: ctx.input.clientId,
          client_secret: ctx.input.clientSecret,
          scope: scopeParam(dataverseScopes),
          grant_type: 'client_credentials'
        })
      );
      let dataverseToken = normalizeMicrosoftToken(dataverseData, {
        operation: 'Dataverse client credentials token exchange',
        requestedScopes: dataverseScopes
      });
      let finOpsBaseUrl = ctx.input.finOpsBaseUrl
        ? normalizeFinOpsBaseUrl(ctx.input.finOpsBaseUrl)
        : undefined;
      let finOpsToken:
        | {
            token: string;
            expiresAt?: string;
          }
        | undefined;

      if (finOpsBaseUrl) {
        let finOpsScopes = [resourceDefaultScope(finOpsBaseUrl)];
        let finOpsData = await requestToken(
          ctx.input.tenantId,
          'Finance and Operations client credentials token exchange',
          new URLSearchParams({
            client_id: ctx.input.clientId,
            client_secret: ctx.input.clientSecret,
            scope: scopeParam(finOpsScopes),
            grant_type: 'client_credentials'
          })
        );
        finOpsToken = normalizeMicrosoftToken(finOpsData, {
          operation: 'Finance and Operations client credentials token exchange',
          requestedScopes: finOpsScopes
        });
      }

      return {
        output: {
          token: dataverseToken.token,
          expiresAt: dataverseToken.expiresAt,
          instanceUrl,
          tenantId: ctx.input.tenantId,
          scopes: dataverseToken.scopes,
          finOpsToken: finOpsToken?.token,
          finOpsExpiresAt: finOpsToken?.expiresAt,
          finOpsBaseUrl
        }
      };
    },

    getProfile: async (ctx: ProfileContext) => getDataverseSystemUserProfile(ctx.output)
  });
