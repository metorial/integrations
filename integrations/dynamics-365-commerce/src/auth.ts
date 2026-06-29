import {
  type CommerceId,
  commerceServiceError,
  createDynamicsCommerceRetailServerClient,
  normalizeRetailServerBaseUrl
} from '@slates/dynamics-commerce-recipes';
import {
  buildApiServiceError,
  createAxios,
  normalizeOAuthTokenResponse,
  requestAxiosData,
  SlateAuth
} from 'slates';
import { z } from 'zod';

let MICROSOFT_LOGIN_BASE = 'https://login.microsoftonline.com';

let commerceIdSchema = z.union([z.string(), z.number()]);

type CommerceAuthOutput = {
  token: string;
  expiresAt?: string;
  tokenType?: string;
  tenantId?: string;
  serverResourceId?: string;
  retailServerUrl: string;
  operatingUnitNumber?: string;
  locale?: string;
  channelId?: CommerceId;
};

type ClientCredentialsInput = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  serverResourceId: string;
  retailServerUrl: string;
  operatingUnitNumber?: string;
  locale?: string;
  channelId?: CommerceId;
};

type MicrosoftTokenResponse = {
  access_token?: unknown;
  expires_in?: unknown;
  token_type?: unknown;
  scope?: unknown;
};

let clientCredentialsInputSchema = z.object({
  tenantId: z.string().describe('Microsoft Entra tenant ID.'),
  clientId: z.string().describe('Microsoft Entra application client ID.'),
  clientSecret: z.string().describe('Microsoft Entra application client secret.'),
  serverResourceId: z
    .string()
    .describe(
      'Retail Server application ID URI/resource ID used to request an access token. The integration requests {serverResourceId}/.default.'
    ),
  retailServerUrl: z
    .string()
    .describe('Commerce Scale Unit Retail Server URL, for example https://host/RetailServer.'),
  operatingUnitNumber: z
    .string()
    .optional()
    .describe('Optional Commerce operating unit number sent as the OUN header.'),
  locale: z.string().optional().describe('Optional default Commerce locale.'),
  channelId: commerceIdSchema.optional().describe('Optional default Commerce channel id.')
});

let accessTokenInputSchema = z.object({
  token: z.string().describe('Existing Retail Server bearer access token.'),
  retailServerUrl: z
    .string()
    .describe('Commerce Scale Unit Retail Server URL, for example https://host/RetailServer.'),
  operatingUnitNumber: z
    .string()
    .optional()
    .describe('Optional Commerce operating unit number sent as the OUN header.'),
  locale: z.string().optional().describe('Optional default Commerce locale.'),
  channelId: commerceIdSchema.optional().describe('Optional default Commerce channel id.')
});

let microsoftAuthApiError = (error: unknown, operation = 'authenticate') =>
  buildApiServiceError(error, {
    providerLabel: 'Microsoft identity platform',
    reason: 'dynamics_commerce_auth_error',
    operation,
    detailKeys: ['error_description', 'error', 'message', 'code'],
    nestedKeys: ['errors', 'details']
  });

let requiredTrimmed = (value: string | undefined, label: string) => {
  let trimmed = value?.trim();
  if (!trimmed) throw commerceServiceError(`${label} is required.`);
  return trimmed;
};

let normalizeTenantId = (tenantId: string) => {
  let tenant = requiredTrimmed(tenantId, 'tenantId');
  if (tenant.includes('/')) {
    throw commerceServiceError('tenantId cannot contain "/".');
  }

  return tenant;
};

let normalizeServerResourceId = (serverResourceId: string) =>
  requiredTrimmed(serverResourceId, 'serverResourceId').replace(/\/+$/, '');

let clientCredentialsScope = (serverResourceId: string) => {
  let resource = normalizeServerResourceId(serverResourceId);
  return resource.endsWith('/.default') ? resource : `${resource}/.default`;
};

let tokenHttp = (tenantId: string) =>
  createAxios({
    baseURL: `${MICROSOFT_LOGIN_BASE}/${encodeURIComponent(tenantId)}/oauth2/v2.0`
  });

let exchangeClientCredentials = async (
  input: ClientCredentialsInput,
  operation = 'client credentials token exchange'
): Promise<CommerceAuthOutput> => {
  let tenantId = normalizeTenantId(input.tenantId);
  let retailServerUrl = normalizeRetailServerBaseUrl(input.retailServerUrl);
  let serverResourceId = normalizeServerResourceId(input.serverResourceId);

  let data = await requestAxiosData<MicrosoftTokenResponse>(
    operation,
    () =>
      tokenHttp(tenantId).post(
        '/token',
        new URLSearchParams({
          client_id: requiredTrimmed(input.clientId, 'clientId'),
          client_secret: requiredTrimmed(input.clientSecret, 'clientSecret'),
          grant_type: 'client_credentials',
          scope: clientCredentialsScope(serverResourceId)
        }).toString(),
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      ),
    microsoftAuthApiError
  );

  let normalized = normalizeOAuthTokenResponse(data, {
    providerLabel: 'Microsoft identity platform',
    operation
  });

  return {
    token: normalized.token,
    expiresAt: normalized.expiresAt,
    tokenType: typeof data.token_type === 'string' ? data.token_type : 'Bearer',
    tenantId,
    serverResourceId,
    retailServerUrl,
    operatingUnitNumber: input.operatingUnitNumber?.trim() || undefined,
    locale: input.locale?.trim() || undefined,
    channelId: input.channelId
  };
};

let profileFromOutput = async (output: CommerceAuthOutput) => {
  let client = createDynamicsCommerceRetailServerClient({
    retailServerUrl: output.retailServerUrl,
    accessToken: output.token,
    operatingUnitNumber: output.operatingUnitNumber,
    locale: output.locale,
    channelId: output.channelId
  });
  let configuration = await client.getChannelConfiguration();
  let record =
    typeof configuration === 'object' &&
    configuration !== null &&
    !Array.isArray(configuration)
      ? (configuration as Record<string, unknown>)
      : {};
  let rawId = record.RecordId ?? record.ChannelId ?? record.OperatingUnitNumber;
  let rawName = record.Name ?? record.OrgUnitName ?? record.ChannelName;

  return {
    profile: {
      id:
        rawId === undefined
          ? (output.operatingUnitNumber ?? output.retailServerUrl)
          : String(rawId),
      name: rawName === undefined ? 'Dynamics 365 Commerce Retail Server' : String(rawName),
      retailServerUrl: output.retailServerUrl,
      operatingUnitNumber: output.operatingUnitNumber,
      tenantId: output.tenantId,
      channelId: output.channelId,
      locale: output.locale
    }
  };
};

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string().describe('Retail Server bearer access token.'),
      expiresAt: z.string().optional().describe('ISO timestamp when the token expires.'),
      tokenType: z.string().optional().describe('OAuth token type returned by Microsoft.'),
      tenantId: z.string().optional().describe('Microsoft Entra tenant ID.'),
      serverResourceId: z
        .string()
        .optional()
        .describe('Retail Server application ID URI/resource ID.'),
      retailServerUrl: z.string().describe('Normalized Retail Server Commerce API URL.'),
      operatingUnitNumber: z.string().optional().describe('Default Retail Server OUN header.'),
      locale: z.string().optional().describe('Default Commerce locale.'),
      channelId: commerceIdSchema.optional().describe('Default Commerce channel id.')
    })
  )
  .addCustomAuth({
    type: 'auth.custom',
    name: 'Client Credentials',
    key: 'client_credentials',
    docs: [
      {
        type: 'docs.auth.custom',
        name: 'Consume Retail Server APIs',
        url: 'https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/consume-retail-server-api'
      },
      {
        type: 'docs.auth.oauth',
        name: 'Microsoft identity platform client credentials flow',
        url: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow'
      }
    ],
    inputSchema: clientCredentialsInputSchema,
    getOutput: async (ctx: { input: ClientCredentialsInput }) => ({
      output: await exchangeClientCredentials(ctx.input)
    }),
    handleTokenRefresh: async (ctx: { input: ClientCredentialsInput }) => ({
      output: await exchangeClientCredentials(ctx.input, 'client credentials token refresh')
    }),
    getProfile: async (ctx: { output: CommerceAuthOutput }) =>
      await profileFromOutput(ctx.output)
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Bearer Access Token',
    key: 'access_token',
    docs: [
      {
        type: 'docs.auth.custom',
        name: 'Consume Retail Server APIs',
        url: 'https://learn.microsoft.com/en-us/dynamics365/commerce/dev-itpro/consume-retail-server-api'
      }
    ],
    inputSchema: accessTokenInputSchema,
    getOutput: async ctx => ({
      output: {
        token: requiredTrimmed(ctx.input.token, 'token'),
        retailServerUrl: normalizeRetailServerBaseUrl(ctx.input.retailServerUrl),
        operatingUnitNumber: ctx.input.operatingUnitNumber?.trim() || undefined,
        locale: ctx.input.locale?.trim() || undefined,
        channelId: ctx.input.channelId
      }
    }),
    getProfile: async (ctx: { output: CommerceAuthOutput }) =>
      await profileFromOutput(ctx.output)
  });
