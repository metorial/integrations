import { createDataverseClientFromContext } from '@slates/microsoft-dataverse-recipes';
import { createTextAttachment, SlateTool } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';

let recordSchema = z.record(z.string(), z.any());

let customerInsightsResourceTypes = [
  'customer_profile',
  'segment',
  'measure',
  'activity'
] as const;

let customerInsightsResourceTypeSchema = z.enum(customerInsightsResourceTypes);
type CustomerInsightsResourceType = z.infer<typeof customerInsightsResourceTypeSchema>;

let customerInsightsResources: Record<
  CustomerInsightsResourceType,
  { entitySetName: string; displayName: string; defaultSelect: string[] }
> = {
  customer_profile: {
    entitySetName: 'msdynci_customerprofiles',
    displayName: 'customer profiles',
    defaultSelect: ['msdynci_customerprofileid', 'msdynci_name', 'createdon', 'modifiedon']
  },
  segment: {
    entitySetName: 'msdynci_segments',
    displayName: 'segments',
    defaultSelect: [
      'msdynci_segmentid',
      'msdynci_name',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  },
  measure: {
    entitySetName: 'msdynci_measures',
    displayName: 'measures',
    defaultSelect: ['msdynci_measureid', 'msdynci_name', 'createdon', 'modifiedon']
  },
  activity: {
    entitySetName: 'msdynci_activities',
    displayName: 'activities',
    defaultSelect: ['msdynci_activityid', 'msdynci_name', 'createdon', 'modifiedon']
  }
};

let resolveResource = (resourceType: CustomerInsightsResourceType, override?: string) => ({
  ...customerInsightsResources[resourceType],
  entitySetName: override?.trim() || customerInsightsResources[resourceType].entitySetName
});

let stripGuidBraces = (value: string) => value.trim().replace(/[{}]/g, '');

let combineFilters = (...filters: Array<string | undefined>) =>
  filters.filter((filter): filter is string => Boolean(filter?.trim())).join(' and ');

let csvEscape = (value: unknown) => {
  if (value === null || value === undefined) return '';
  let text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

let inferColumns = (records: Record<string, unknown>[], preferred?: string[]) => {
  if (preferred && preferred.length > 0) return preferred;
  let columns = new Set<string>();
  for (let record of records) {
    for (let key of Object.keys(record)) {
      columns.add(key);
    }
  }

  return [...columns];
};

let toCsv = (records: Record<string, unknown>[], columns: string[]) =>
  [
    columns.map(csvEscape).join(','),
    ...records.map(record => columns.map(column => csvEscape(record[column])).join(','))
  ].join('\n');

let listInputSchema = z.object({
  resourceType: customerInsightsResourceTypeSchema.describe(
    'Customer Insights record type to query'
  ),
  entitySetNameOverride: z
    .string()
    .optional()
    .describe(
      'Override the default Dataverse entity set name for tenant-specific table naming.'
    ),
  select: z
    .array(z.string())
    .optional()
    .describe('Columns to return. Defaults to core columns for the selected type.'),
  filter: z.string().optional().describe('OData $filter expression'),
  orderBy: z.string().optional().describe('OData $orderby expression'),
  expand: z.string().optional().describe('OData $expand expression'),
  top: z.number().int().positive().optional().describe('OData $top value'),
  pageSize: z.number().int().positive().optional().describe('Preferred Dataverse page size'),
  nextLink: z
    .string()
    .optional()
    .describe('Dataverse @odata.nextLink from a previous response'),
  includeCount: z.boolean().optional().describe('Whether to request @odata.count')
});

export let listCustomerInsightsRecords = SlateTool.create(spec, {
  key: 'list_customer_insights_records',
  name: 'List Customer Insights Records',
  description:
    'List Dynamics 365 Customer Insights customer profiles, segments, measures, and activities with Dataverse OData query options.',
  tags: { readOnly: true, destructive: false }
})
  .input(listInputSchema)
  .output(
    z.object({
      resourceType: customerInsightsResourceTypeSchema,
      entitySetName: z.string(),
      records: z.array(recordSchema),
      nextLink: z.string().nullable(),
      count: z.number().optional()
    })
  )
  .handleInvocation(async ctx => {
    let resource = resolveResource(ctx.input.resourceType, ctx.input.entitySetNameOverride);
    let page = await createDataverseClientFromContext(ctx).listRecords(
      resource.entitySetName,
      {
        select: ctx.input.select ?? resource.defaultSelect,
        filter: ctx.input.filter,
        orderBy: ctx.input.orderBy,
        expand: ctx.input.expand,
        top: ctx.input.top,
        pageSize: ctx.input.pageSize,
        nextLink: ctx.input.nextLink,
        includeCount: ctx.input.includeCount
      }
    );

    return {
      output: {
        resourceType: ctx.input.resourceType,
        entitySetName: resource.entitySetName,
        records: page.records,
        nextLink: page.nextLink,
        count: page.count
      },
      message: `Retrieved **${page.records.length}** Dynamics 365 Customer Insights ${resource.displayName}.`
    };
  })
  .build();

export let getCustomerInsightsRecord = SlateTool.create(spec, {
  key: 'get_customer_insights_record',
  name: 'Get Customer Insights Record',
  description:
    'Retrieve one Dynamics 365 Customer Insights customer profile, segment, measure, or activity by Dataverse GUID.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      resourceType: customerInsightsResourceTypeSchema.describe(
        'Customer Insights record type'
      ),
      entitySetNameOverride: z
        .string()
        .optional()
        .describe('Override the default Dataverse entity set name.'),
      recordId: z.string().describe('Dataverse record GUID'),
      select: z.array(z.string()).optional().describe('Columns to return'),
      expand: z.string().optional().describe('OData $expand expression')
    })
  )
  .output(
    z.object({
      resourceType: customerInsightsResourceTypeSchema,
      entitySetName: z.string(),
      record: recordSchema
    })
  )
  .handleInvocation(async ctx => {
    let resource = resolveResource(ctx.input.resourceType, ctx.input.entitySetNameOverride);
    let record = await createDataverseClientFromContext(ctx).getRecord(
      resource.entitySetName,
      ctx.input.recordId,
      {
        select: ctx.input.select ?? resource.defaultSelect,
        expand: ctx.input.expand
      }
    );

    return {
      output: {
        resourceType: ctx.input.resourceType,
        entitySetName: resource.entitySetName,
        record
      },
      message: `Retrieved Dynamics 365 Customer Insights ${resource.displayName} record **${ctx.input.recordId}**.`
    };
  })
  .build();

export let exportSegmentMembers = SlateTool.create(spec, {
  key: 'export_segment_members',
  name: 'Export Segment Members',
  description:
    'Export Dynamics 365 Customer Insights segment-member rows from Dataverse as CSV or JSON through a Slate text attachment.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      entitySetNameOverride: z
        .string()
        .optional()
        .describe('Segment member entity set name. Defaults to msdynci_segmentmembers.'),
      segmentId: z
        .string()
        .optional()
        .describe('Optional segment GUID used to build a default filter.'),
      segmentFilterColumn: z
        .string()
        .optional()
        .describe(
          'Lookup/value column used with segmentId. Defaults to _msdynci_segmentid_value.'
        ),
      filter: z
        .string()
        .optional()
        .describe('Additional or replacement OData $filter expression.'),
      select: z
        .array(z.string())
        .optional()
        .describe('Columns to export. When omitted, columns are inferred from returned rows.'),
      orderBy: z.string().optional().describe('OData $orderby expression'),
      maxPages: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Maximum Dataverse pages to follow. Defaults to the recipe limit.'),
      maxRecords: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Maximum records to export. Defaults to 5000.'),
      pageSize: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Preferred Dataverse page size'),
      exportFormat: z
        .enum(['csv', 'json'])
        .optional()
        .describe('Attachment format. Defaults to csv.'),
      fileName: z.string().optional().describe('Attachment filename')
    })
  )
  .output(
    z.object({
      entitySetName: z.string(),
      segmentId: z.string().optional(),
      recordCount: z.number(),
      complete: z.boolean(),
      nextLink: z.string().nullable(),
      fileName: z.string(),
      mimeType: z.string(),
      attachmentCount: z.number()
    })
  )
  .handleInvocation(async ctx => {
    let entitySetName = ctx.input.entitySetNameOverride?.trim() || 'msdynci_segmentmembers';
    let segmentFilter = ctx.input.segmentId
      ? `${ctx.input.segmentFilterColumn ?? '_msdynci_segmentid_value'} eq ${stripGuidBraces(ctx.input.segmentId)}`
      : undefined;
    let filter = combineFilters(segmentFilter, ctx.input.filter) || undefined;
    let result = await createDataverseClientFromContext(ctx).listAllRecords(entitySetName, {
      select: ctx.input.select,
      filter,
      orderBy: ctx.input.orderBy,
      pageSize: ctx.input.pageSize,
      maxPages: ctx.input.maxPages,
      maxRecords: ctx.input.maxRecords ?? 5000
    });
    let records = result.records as Record<string, unknown>[];
    let format = ctx.input.exportFormat ?? 'csv';
    let columns = inferColumns(records, ctx.input.select);
    let content =
      format === 'json' ? JSON.stringify(records, null, 2) : toCsv(records, columns);
    let mimeType = format === 'json' ? 'application/json' : 'text/csv';
    let fileName =
      ctx.input.fileName ??
      `customer-insights-segment-members-${ctx.input.segmentId ?? 'export'}.${format}`;

    return {
      output: {
        entitySetName,
        segmentId: ctx.input.segmentId,
        recordCount: records.length,
        complete: result.complete,
        nextLink: result.nextLink,
        fileName,
        mimeType,
        attachmentCount: 1
      },
      message: `Exported **${records.length}** Customer Insights segment member rows.`,
      attachments: [createTextAttachment(content, mimeType)]
    };
  })
  .build();
