import {
  createDataverseClientFromContext,
  dataverseApiError,
  dataverseValidationError,
  normalizeDataverseInstanceUrl
} from '@slates/microsoft-dataverse-recipes';
import { createAxios, normalizeOAuthTokenResponse, requestAxiosData, SlateAuth } from 'slates';
import { z } from 'zod';

let MICROSOFT_LOGIN_BASE = 'https://login.microsoftonline.com';
let DATAVERSE_DISCOVERY_RESOURCE = 'https://globaldisco.crm.dynamics.com';
let DEFAULT_TENANT = 'organizations';

type DataverseOAuthInput = {
  tenantId?: string;
  instanceUrl?: string;
};

type DataverseAuthOutput = {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  tokenType?: string;
  tenantId?: string;
  instanceUrl: string;
  scopes?: string[];
};

type MicrosoftTokenResponse = {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
  token_type?: unknown;
  scope?: unknown;
};

type DataverseInstance = {
  Url?: string;
  ApiUrl?: string;
  FriendlyName?: string;
};

let oauthInputSchema = z.object({
  instanceUrl: z
    .string()
    .optional()
    .describe(
      'Optional Dataverse environment URL. When omitted, OAuth uses global discovery and selects the first accessible environment.'
    )
});

let oauthScopes = [
  {
    title: 'Dataverse User Impersonation',
    description: 'Access Microsoft Dataverse as the signed-in user.',
    scope: 'user_impersonation'
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
  }
];

let tokenHttpCache = new Map<string, ReturnType<typeof createAxios>>();
let discoveryHttp = createAxios({ baseURL: DATAVERSE_DISCOVERY_RESOURCE });

let isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

let stringValue = (value: unknown) => (typeof value === 'string' ? value : undefined);

let uniqueScopes = (scopes: string[]) => [...new Set(scopes.filter(Boolean))];

let resolveTenant = (input: DataverseOAuthInput | undefined) => {
  let tenant = input?.tenantId?.trim() || DEFAULT_TENANT;
  if (tenant.includes('/')) {
    throw dataverseValidationError('Microsoft tenant ID cannot contain "/".');
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

let scopeResourceFromInput = (input: DataverseOAuthInput | undefined) =>
  input?.instanceUrl
    ? normalizeDataverseInstanceUrl(input.instanceUrl)
    : DATAVERSE_DISCOVERY_RESOURCE;

let buildResourceScopes = (scopes: string[], resource: string) =>
  uniqueScopes(scopes).map(scope =>
    scope === 'user_impersonation' ? `${resource}/user_impersonation` : scope
  );

let parseGrantedScopes = (scope: unknown, fallback: string[]) => {
  if (Array.isArray(scope)) {
    return uniqueScopes(scope.filter((item): item is string => typeof item === 'string'));
  }

  if (typeof scope === 'string') {
    return uniqueScopes(scope.split(/\s+/g));
  }

  return uniqueScopes(fallback);
};

let requestToken = async (tenant: string, operation: string, body: URLSearchParams) =>
  requestAxiosData<MicrosoftTokenResponse>(
    operation,
    () =>
      tokenHttp(tenant).post('/token', body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json'
        }
      }),
    dataverseApiError
  );

let normalizeToken = (
  data: MicrosoftTokenResponse,
  options: {
    operation: string;
    requestedScopes: string[];
    previousRefreshToken?: string;
    tenantId: string;
  }
) => {
  let normalized = normalizeOAuthTokenResponse(data, {
    providerLabel: 'Microsoft Dataverse',
    operation: options.operation,
    previousRefreshToken: options.previousRefreshToken,
    refreshTokenFallbackMode: 'falsy'
  });

  return {
    token: normalized.token,
    refreshToken: normalized.refreshToken,
    expiresAt: normalized.expiresAt,
    tokenType: typeof data.token_type === 'string' ? data.token_type : 'Bearer',
    tenantId: options.tenantId,
    scopes: parseGrantedScopes(data.scope, options.requestedScopes)
  };
};

let discoverInstances = async (token: string) => {
  let data = await requestAxiosData<{ value?: DataverseInstance[] }>(
    'Dataverse environment discovery',
    () =>
      discoveryHttp.get('/api/discovery/v2.0/Instances', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }),
    dataverseApiError
  );

  return data.value ?? [];
};

let getProfileFromOutput = async (output: DataverseAuthOutput) => {
  let client = createDataverseClientFromContext({
    auth: output,
    config: { instanceUrl: output.instanceUrl }
  });
  let whoAmI = await client.invokeOperation({
    operationType: 'function',
    operationName: 'WhoAmI'
  });
  let userId = isRecord(whoAmI) ? stringValue(whoAmI.UserId) : undefined;

  if (!userId) {
    return {
      profile: {
        id: output.tenantId ?? output.instanceUrl,
        name: 'Microsoft Dataverse'
      }
    };
  }

  let user = await client.getRecord('systemusers', userId, {
    select: ['systemuserid', 'fullname', 'internalemailaddress']
  });

  return {
    profile: {
      id: stringValue(user.systemuserid) ?? userId,
      name: stringValue(user.fullname),
      email: stringValue(user.internalemailaddress)
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
      instanceUrl: z.string(),
      scopes: z.array(z.string()).optional()
    })
  )
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
        name: 'Dataverse Web API authentication documentation',
        url: 'https://learn.microsoft.com/en-us/power-apps/developer/data-platform/authenticate-oauth'
      }
    ],
    scopes: oauthScopes,

    getAuthorizationUrl: async ctx => {
      let tenant = resolveTenant(ctx.input);
      let resource = scopeResourceFromInput(ctx.input);
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        response_mode: 'query',
        scope: buildResourceScopes(ctx.scopes, resource).join(' '),
        state: ctx.state
      });

      return {
        url: `${MICROSOFT_LOGIN_BASE}/${encodeURIComponent(tenant)}/oauth2/v2.0/authorize?${params.toString()}`
      };
    },

    handleCallback: async (ctx: {
      clientId: string;
      clientSecret: string;
      code: string;
      redirectUri: string;
      input: DataverseOAuthInput;
      scopes: string[];
    }) => {
      let tenant = resolveTenant(ctx.input);
      let requestedScopes = uniqueScopes(ctx.scopes);
      let resource = scopeResourceFromInput(ctx.input);
      let initialData = await requestToken(
        tenant,
        'OAuth token exchange',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          code: ctx.code,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code',
          scope: buildResourceScopes(requestedScopes, resource).join(' ')
        })
      );
      let initial = normalizeToken(initialData, {
        operation: 'OAuth token exchange',
        requestedScopes,
        tenantId: tenant
      });

      if (ctx.input.instanceUrl) {
        return {
          output: {
            ...initial,
            instanceUrl: normalizeDataverseInstanceUrl(ctx.input.instanceUrl)
          }
        };
      }

      if (!initial.refreshToken) {
        throw dataverseValidationError(
          'Microsoft did not return a refresh token. Keep offline_access selected so Slates can exchange the discovery token for a Dataverse environment token.'
        );
      }

      let instances = await discoverInstances(initial.token);
      let first = instances[0];
      let discoveredUrl = first?.Url ?? first?.ApiUrl;
      if (!discoveredUrl) {
        throw dataverseValidationError(
          'No Dataverse environments were found for this Microsoft account.'
        );
      }

      let instanceUrl = normalizeDataverseInstanceUrl(discoveredUrl);
      let instanceData = await requestToken(
        tenant,
        'Dataverse environment token exchange',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: initial.refreshToken,
          scope: buildResourceScopes(requestedScopes, instanceUrl).join(' ')
        })
      );
      let instanceToken = normalizeToken(instanceData, {
        operation: 'Dataverse environment token exchange',
        requestedScopes,
        previousRefreshToken: initial.refreshToken,
        tenantId: tenant
      });

      return {
        output: {
          ...instanceToken,
          instanceUrl
        }
      };
    },

    handleTokenRefresh: async (ctx: {
      clientId: string;
      clientSecret: string;
      input: DataverseOAuthInput;
      output: DataverseAuthOutput;
      scopes: string[];
    }) => {
      if (!ctx.output.refreshToken) {
        throw dataverseValidationError(
          'This Microsoft Dataverse connection does not have a refresh token. Reconnect with offline_access enabled.'
        );
      }

      let tenant = resolveTenant({ tenantId: ctx.output.tenantId ?? ctx.input.tenantId });
      let instanceUrl = normalizeDataverseInstanceUrl(ctx.output.instanceUrl);
      let requestedScopes = uniqueScopes(ctx.scopes);
      let data = await requestToken(
        tenant,
        'OAuth token refresh',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.refreshToken,
          grant_type: 'refresh_token',
          scope: buildResourceScopes(requestedScopes, instanceUrl).join(' ')
        })
      );
      let token = normalizeToken(data, {
        operation: 'OAuth token refresh',
        requestedScopes,
        previousRefreshToken: ctx.output.refreshToken,
        tenantId: tenant
      });

      return {
        output: {
          ...token,
          instanceUrl
        }
      };
    },

    getProfile: async (ctx: { output: DataverseAuthOutput }) =>
      getProfileFromOutput(ctx.output)
  })
  .addCustomAuth({
    type: 'auth.custom',
    name: 'Client Credentials',
    key: 'client_credentials',
    inputSchema: z.object({
      tenantId: z.string().describe('Microsoft Entra tenant ID'),
      clientId: z.string().describe('Application client ID'),
      clientSecret: z.string().describe('Application client secret'),
      instanceUrl: z
        .string()
        .describe('Dataverse environment URL, such as https://yourorg.crm.dynamics.com')
    }),
    getOutput: async ctx => {
      let instanceUrl = normalizeDataverseInstanceUrl(ctx.input.instanceUrl);
      let data = await requestToken(
        ctx.input.tenantId,
        'client credentials token exchange',
        new URLSearchParams({
          client_id: ctx.input.clientId,
          client_secret: ctx.input.clientSecret,
          grant_type: 'client_credentials',
          scope: `${instanceUrl}/.default`
        })
      );
      let token = normalizeToken(data, {
        operation: 'client credentials token exchange',
        requestedScopes: [`${instanceUrl}/.default`],
        tenantId: ctx.input.tenantId
      });

      return {
        output: {
          ...token,
          instanceUrl
        }
      };
    },
    getProfile: async (ctx: { output: DataverseAuthOutput }) =>
      getProfileFromOutput(ctx.output)
  });
