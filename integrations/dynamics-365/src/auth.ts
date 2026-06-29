import {
  dataverseApiError,
  dataverseValidationError,
  normalizeDataverseInstanceUrl
} from '@slates/microsoft-dataverse-recipes';
import { axios, normalizeOAuthTokenResponse, requestAxiosData, SlateAuth } from 'slates';
import { z } from 'zod';

let DISCOVERY_RESOURCE = 'https://globaldisco.crm.dynamics.com';

type MicrosoftTokenResponse = {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
  token_type?: unknown;
  scope?: unknown;
};

type DynamicsAuthOutput = {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  instanceUrl: string;
  tenantId: string;
};

let scopes = [
  {
    title: 'User Impersonation',
    description: 'Access Dynamics 365 Dataverse as the signed-in user',
    scope: 'user_impersonation'
  },
  {
    title: 'Offline Access',
    description: 'Maintain access with refresh tokens',
    scope: 'offline_access'
  }
];

let buildAuthScopes = (ctxScopes: string[]) => {
  let impersonation = ctxScopes.filter(scope => scope !== 'offline_access');
  let scoped = impersonation.map(scope => `${DISCOVERY_RESOURCE}/${scope}`);
  if (ctxScopes.includes('offline_access')) scoped.push('offline_access');
  return scoped.join(' ');
};

let buildInstanceScope = (instanceUrl: string, ctxScopes: string[]) => {
  let normalizedInstanceUrl = normalizeDataverseInstanceUrl(instanceUrl);
  let parts = [`${normalizedInstanceUrl}/.default`];
  if (ctxScopes.includes('offline_access')) parts.push('offline_access');
  return parts.join(' ');
};

let tokenEndpoint = (tenant: string) =>
  `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/token`;

let requestMicrosoftToken = (tenant: string, operation: string, body: URLSearchParams) =>
  requestAxiosData<MicrosoftTokenResponse>(
    operation,
    () =>
      axios.post(tokenEndpoint(tenant), body.toString(), {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }),
    error => dataverseApiError(error, operation)
  );

let normalizeMicrosoftToken = (
  data: MicrosoftTokenResponse,
  options: {
    operation: string;
    previousRefreshToken?: string;
  }
) =>
  normalizeOAuthTokenResponse(data, {
    providerLabel: 'Microsoft Dataverse',
    operation: options.operation,
    previousRefreshToken: options.previousRefreshToken,
    refreshTokenFallbackMode: 'falsy',
    accessTokenMessage: `Microsoft Dataverse OAuth ${options.operation} did not return an access token.`
  });

let discoverInstances = (token: string) =>
  requestAxiosData<{ value?: Array<{ Url?: string; FriendlyName?: string }> }>(
    'discover Dataverse instances',
    () =>
      axios.get(`${DISCOVERY_RESOURCE}/api/discovery/v2.0/Instances`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
    error => dataverseApiError(error, 'discover Dataverse instances')
  );

let requestDataverseData = <T>(instanceUrl: string, token: string, path: string) =>
  requestAxiosData<T>(
    'get Dataverse profile',
    () =>
      axios.get(`${normalizeDataverseInstanceUrl(instanceUrl)}/api/data/v9.2/${path}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
    error => dataverseApiError(error, 'get Dataverse profile')
  );

function createMicrosoftOauth(name: string, key: string, tenant: string) {
  return {
    type: 'auth.oauth' as const,
    name,
    key,
    docs: [
      {
        type: 'docs.auth.oauth' as const,
        name: 'OAuth documentation',
        url: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow'
      },
      {
        type: 'docs.auth.oauth_scopes' as const,
        name: 'Dataverse Web API OAuth scopes',
        url: 'https://learn.microsoft.com/en-us/power-apps/developer/data-platform/authenticate-oauth'
      }
    ],
    scopes,

    getAuthorizationUrl: async (ctx: any) => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        scope: buildAuthScopes(ctx.scopes),
        state: ctx.state
      });

      return {
        url: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`
      };
    },

    handleCallback: async (ctx: any) => {
      let discoveryTokenData = await requestMicrosoftToken(
        tenant,
        'discovery token exchange',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          code: ctx.code,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code',
          scope: buildAuthScopes(ctx.scopes)
        })
      );
      let discoveryToken = normalizeMicrosoftToken(discoveryTokenData, {
        operation: 'discovery token exchange'
      });

      let discovery = await discoverInstances(discoveryToken.token);
      let instances = discovery.value ?? [];
      let instanceUrl = instances[0]?.Url;
      if (!instanceUrl) {
        throw dataverseValidationError(
          'No Dataverse environments were found for this Microsoft account. The signed-in user must have access to at least one Dynamics 365 Dataverse environment.'
        );
      }

      if (!discoveryToken.refreshToken) {
        throw dataverseValidationError(
          'Microsoft did not return a refresh token. Ensure offline_access is selected and the Entra app can issue refresh tokens.'
        );
      }

      let normalizedInstanceUrl = normalizeDataverseInstanceUrl(instanceUrl);
      let instanceTokenData = await requestMicrosoftToken(
        tenant,
        'instance token exchange',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: discoveryToken.refreshToken,
          scope: buildInstanceScope(normalizedInstanceUrl, ctx.scopes)
        })
      );
      let instanceToken = normalizeMicrosoftToken(instanceTokenData, {
        operation: 'instance token exchange',
        previousRefreshToken: discoveryToken.refreshToken
      });

      return {
        output: {
          token: instanceToken.token,
          refreshToken: instanceToken.refreshToken,
          expiresAt: instanceToken.expiresAt,
          instanceUrl: normalizedInstanceUrl,
          tenantId: tenant
        }
      };
    },

    handleTokenRefresh: async (ctx: any) => {
      if (!ctx.output.refreshToken) {
        throw dataverseValidationError(
          'Cannot refresh Microsoft Dataverse OAuth without a refresh token.'
        );
      }

      let instanceUrl = normalizeDataverseInstanceUrl(ctx.output.instanceUrl);
      let tokenData = await requestMicrosoftToken(
        tenant,
        'token refresh',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.refreshToken,
          grant_type: 'refresh_token',
          scope: buildInstanceScope(instanceUrl, ctx.scopes)
        })
      );
      let token = normalizeMicrosoftToken(tokenData, {
        operation: 'token refresh',
        previousRefreshToken: ctx.output.refreshToken
      });

      return {
        output: {
          token: token.token,
          refreshToken: token.refreshToken,
          expiresAt: token.expiresAt,
          instanceUrl,
          tenantId: ctx.output.tenantId
        }
      };
    },

    getProfile: async (ctx: { output: DynamicsAuthOutput }) => {
      let whoAmI = await requestDataverseData<{ UserId?: string }>(
        ctx.output.instanceUrl,
        ctx.output.token,
        'WhoAmI'
      );
      let userId = whoAmI.UserId;
      if (!userId) {
        throw dataverseValidationError('Dataverse WhoAmI did not return a user ID.');
      }

      let user = await requestDataverseData<{
        fullname?: string;
        internalemailaddress?: string;
        systemuserid?: string;
      }>(
        ctx.output.instanceUrl,
        ctx.output.token,
        `systemusers(${userId})?$select=fullname,internalemailaddress,systemuserid`
      );

      return {
        profile: {
          id: user.systemuserid ?? userId,
          name: user.fullname,
          email: user.internalemailaddress
        }
      };
    }
  };
}

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional(),
      instanceUrl: z.string(),
      tenantId: z.string()
    })
  )
  .addOauth(createMicrosoftOauth('Work & Personal', 'oauth_common', 'common'))
  .addOauth(createMicrosoftOauth('Work Only', 'oauth_organizations', 'organizations'))
  .addCustomAuth({
    type: 'auth.custom',
    name: 'Client Credentials (Server-to-Server)',
    key: 'client_credentials',

    inputSchema: z.object({
      tenantId: z.string().describe('Microsoft Entra ID tenant ID'),
      clientId: z.string().describe('Application (client) ID from the app registration'),
      clientSecret: z.string().describe('Client secret from the app registration'),
      instanceUrl: z
        .string()
        .describe(
          'Dynamics 365 Dataverse environment URL (for example, https://yourorg.crm.dynamics.com)'
        )
    }),

    getOutput: async ctx => {
      let tenantId = ctx.input.tenantId.trim();
      if (!tenantId) {
        throw dataverseValidationError('Microsoft Entra tenant ID is required.');
      }
      let instanceUrl = normalizeDataverseInstanceUrl(ctx.input.instanceUrl);

      let tokenData = await requestMicrosoftToken(
        tenantId,
        'client credentials token exchange',
        new URLSearchParams({
          client_id: ctx.input.clientId,
          client_secret: ctx.input.clientSecret,
          scope: `${instanceUrl}/.default`,
          grant_type: 'client_credentials'
        })
      );
      let token = normalizeMicrosoftToken(tokenData, {
        operation: 'client credentials token exchange'
      });

      return {
        output: {
          token: token.token,
          refreshToken: undefined,
          expiresAt: token.expiresAt,
          instanceUrl,
          tenantId
        }
      };
    },

    getProfile: async (ctx: {
      output: DynamicsAuthOutput;
      input: { tenantId: string; clientId: string; clientSecret: string; instanceUrl: string };
    }) => {
      let whoAmI = await requestDataverseData<{
        UserId?: string;
        OrganizationId?: string;
      }>(ctx.output.instanceUrl, ctx.output.token, 'WhoAmI');

      return {
        profile: {
          id: whoAmI.UserId,
          name: `Application User (${whoAmI.OrganizationId ?? 'unknown organization'})`
        }
      };
    }
  });
