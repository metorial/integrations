import {
  applyCommerceChannelDefaults,
  buildCommercePageSummary,
  type CommerceId,
  commerceServiceError,
  createDynamicsCommerceRetailServerClient,
  getCommerceCollection,
  resolveRetailServerBaseUrl
} from '@slates/dynamics-commerce-recipes';
import { z } from 'zod';

type CommerceAuth = {
  token: string;
  retailServerUrl?: string;
  operatingUnitNumber?: string;
  locale?: string;
  channelId?: CommerceId;
};

type CommerceConfig = {
  retailServerUrl?: string;
  operatingUnitNumber?: string;
  locale?: string;
  channelId?: CommerceId;
  catalogId?: CommerceId;
  defaultPageSize?: number;
  maxPageSize?: number;
};

export type CommerceToolContext<
  Input extends Record<string, unknown> = Record<string, unknown>
> = {
  auth: CommerceAuth;
  config?: CommerceConfig;
  input: Input;
};

export let rawCommerceValueSchema = z.unknown().describe('Raw Retail Server response value.');

export let pageOutputSchema = z.object({
  top: z.number().describe('Requested page size.'),
  skip: z.number().describe('Requested skip offset.'),
  count: z.number().describe('Number of records returned.'),
  nextPageToken: z
    .string()
    .optional()
    .describe('Numeric skip token to request the next page when another page is likely.')
});

export let commerceRecordSummarySchema = z.object({
  id: z.string().optional().describe('Best-effort stable id extracted from the record.'),
  name: z.string().optional().describe('Best-effort display name extracted from the record.'),
  record: rawCommerceValueSchema
});

export let commerceResultOutputSchema = z.object({
  action: z.string().describe('Commerce operation that was executed.'),
  count: z.number().describe('Number of primary records returned.'),
  page: pageOutputSchema.optional().describe('Pagination summary for list/search actions.'),
  summary: commerceRecordSummarySchema
    .optional()
    .describe('Best-effort summary for a single primary record.'),
  summaries: z
    .array(commerceRecordSummarySchema)
    .optional()
    .describe('Best-effort summaries for primary records.'),
  result: rawCommerceValueSchema.optional(),
  records: z.array(rawCommerceValueSchema).optional().describe('Primary record collection.')
});

export let metadataOutputSchema = z.object({
  mimeType: z.string().describe('Attachment MIME type.'),
  attachmentCount: z.number().describe('Number of Slate attachments returned.')
});

let idKeys = [
  'RecordId',
  'recordId',
  'Id',
  'ID',
  'id',
  'ProductId',
  'ItemId',
  'AccountNumber',
  'CustomerAccount',
  'SalesId',
  'TransactionId',
  'CartId',
  'ChannelId',
  'CatalogId',
  'StoreNumber',
  'OrgUnitNumber'
];

let nameKeys = [
  'Name',
  'name',
  'DisplayName',
  'displayName',
  'ProductName',
  'Description',
  'description',
  'AccountName',
  'ChannelName',
  'OrgUnitName',
  'StoreName'
];

let isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

let firstStringable = (record: Record<string, unknown>, keys: string[]) => {
  for (let key of keys) {
    let value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }

  return undefined;
};

export let summarizeCommerceRecord = (record: unknown) => {
  if (!isRecord(record)) return { record };

  return {
    id: firstStringable(record, idKeys),
    name: firstStringable(record, nameKeys),
    record
  };
};

export let createCommerceClient = (ctx: CommerceToolContext) =>
  createDynamicsCommerceRetailServerClient({
    retailServerUrl: resolveRetailServerBaseUrl({
      retailServerUrl: ctx.config?.retailServerUrl,
      authRetailServerUrl: ctx.auth.retailServerUrl
    }),
    accessToken: ctx.auth.token,
    operatingUnitNumber: ctx.config?.operatingUnitNumber ?? ctx.auth.operatingUnitNumber,
    locale: ctx.config?.locale ?? ctx.auth.locale,
    channelId: ctx.config?.channelId ?? ctx.auth.channelId,
    defaultPageSize: ctx.config?.defaultPageSize,
    maxPageSize: ctx.config?.maxPageSize
  });

export let withCommerceDefaults = <T extends Record<string, unknown>>(
  ctx: CommerceToolContext,
  input: T
) =>
  applyCommerceChannelDefaults(input, {
    channelId: ctx.config?.channelId ?? ctx.auth.channelId,
    catalogId: ctx.config?.catalogId,
    locale: ctx.config?.locale ?? ctx.auth.locale
  });

export let buildCommerceToolOutput = (
  action: string,
  result: unknown,
  options: {
    collection?: boolean;
    pageInput?: Record<string, unknown>;
    includeResult?: boolean;
  } = {}
) => {
  if (options.collection) {
    let records = getCommerceCollection(result);
    return {
      action,
      count: records.length,
      page: options.pageInput
        ? buildCommercePageSummary(result, options.pageInput as any)
        : undefined,
      summaries: records.map(summarizeCommerceRecord),
      records,
      result: options.includeResult === false ? undefined : result
    };
  }

  return {
    action,
    count: result === undefined ? 0 : 1,
    summary: result === undefined ? undefined : summarizeCommerceRecord(result),
    result: options.includeResult === false ? undefined : result
  };
};

export let commerceMessage = (
  subject: string,
  action: string,
  output: ReturnType<typeof buildCommerceToolOutput>
) => {
  let readableAction = action.replace(/_/g, ' ');
  return `Completed **${readableAction}** for ${subject}; returned **${output.count}** primary record(s).`;
};

export let requireConfirmedWrite = (
  confirmWrite: boolean | undefined,
  action: string,
  resource: string
) => {
  if (confirmWrite !== true) {
    throw commerceServiceError(
      `confirmWrite must be true to run ${action.replace(/_/g, ' ')} on Commerce ${resource}.`
    );
  }
};

export let requireNonEmptyRecord = (value: unknown, label: string) => {
  if (!isRecord(value) || Object.keys(value).length === 0) {
    throw commerceServiceError(`${label} must include at least one field.`);
  }
};

let isCommercePrimitive = (value: unknown) =>
  value === null ||
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean' ||
  value instanceof Date;

export let assertPrimitiveAdditionalFields = (value: unknown, label = 'additionalFields') => {
  if (value === undefined) return;
  if (!isRecord(value)) {
    throw commerceServiceError(`${label} must be an object when provided.`);
  }

  for (let [key, child] of Object.entries(value)) {
    if (!isCommercePrimitive(child)) {
      throw commerceServiceError(
        `${label}.${key} must be a string, number, boolean, date, or null value.`
      );
    }
  }
};
