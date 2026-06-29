import {
  createDataverseClientFromContext,
  type DataversePrimitiveKeyValue,
  type DataverseRecord,
  type DataverseRecordKey,
  dataverseRecordKeyFromInput
} from '@slates/microsoft-dataverse-recipes';
import { z } from 'zod';

type DynamicsDataverseContext = {
  auth?: {
    token?: string;
    instanceUrl?: string;
  };
  config?: {
    instanceUrl?: string;
    apiVersion?: string;
  };
};

export let dataverseRecordSchema = z.record(z.string(), z.any());

export let dataverseAlternateKeySchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()])
);

export let createDynamicsClient = (ctx: DynamicsDataverseContext) =>
  createDataverseClientFromContext(ctx);

export let recordKeyFromInput = (input: {
  recordId?: string;
  alternateKey?: Record<string, DataversePrimitiveKeyValue>;
}): DataverseRecordKey => dataverseRecordKeyFromInput(input);

export let inferBindingType = (input: {
  bindingType?: 'unbound' | 'entity' | 'collection';
  entitySetName?: string;
  recordId?: string;
}) => {
  if (input.bindingType) return input.bindingType;
  if (input.recordId) return 'entity' as const;
  if (input.entitySetName) return 'collection' as const;
  return 'unbound' as const;
};

export let inferDataverseRecordId = (
  record: DataverseRecord | undefined,
  explicitRecordId?: string
) => {
  if (explicitRecordId) return explicitRecordId;
  if (!record) return undefined;

  let odataId = record['@odata.id'];
  if (typeof odataId === 'string') {
    let match = /\(([0-9a-fA-F-]{36})\)$/.exec(odataId);
    if (match?.[1]) return match[1];
  }

  for (let [key, value] of Object.entries(record)) {
    if (
      typeof value === 'string' &&
      /^[0-9a-fA-F-]{36}$/.test(value) &&
      key.toLowerCase().endsWith('id') &&
      !key.startsWith('_') &&
      !key.includes('@')
    ) {
      return value;
    }
  }

  return undefined;
};

export let dataverseContinuation = (result: {
  nextLink?: string | null;
  count?: number;
  pagesRead?: number;
  complete?: boolean;
}) => ({
  nextLink: result.nextLink ?? null,
  count: result.count,
  pagesRead: result.pagesRead,
  complete: result.complete
});
