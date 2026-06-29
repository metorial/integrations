import {
  createDataverseClientFromContext,
  dataverseValidationError
} from '@slates/microsoft-dataverse-recipes';
import { createTextAttachment, SlateTool } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';

let recordSchema = z.record(z.string(), z.any());

let contactCenterResourceTypes = [
  'conversation',
  'session',
  'transcript',
  'agent',
  'queue',
  'routing_state',
  'linked_case'
] as const;

let contactCenterResourceTypeSchema = z.enum(contactCenterResourceTypes);
type ContactCenterResourceType = z.infer<typeof contactCenterResourceTypeSchema>;

let contactCenterResources: Record<
  ContactCenterResourceType,
  { entitySetName: string; displayName: string; defaultSelect: string[] }
> = {
  conversation: {
    entitySetName: 'msdyn_ocliveworkitems',
    displayName: 'conversations',
    defaultSelect: [
      'activityid',
      'subject',
      'msdyn_channel',
      'msdyn_liveworkstreamid',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  },
  session: {
    entitySetName: 'msdyn_ocsessions',
    displayName: 'sessions',
    defaultSelect: [
      'msdyn_ocsessionid',
      'msdyn_name',
      'msdyn_liveworkitemid',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  },
  transcript: {
    entitySetName: 'msdyn_transcripts',
    displayName: 'transcripts',
    defaultSelect: [
      'msdyn_transcriptid',
      'msdyn_name',
      'msdyn_transcript',
      'createdon',
      'modifiedon'
    ]
  },
  agent: {
    entitySetName: 'systemusers',
    displayName: 'agents',
    defaultSelect: [
      'systemuserid',
      'fullname',
      'internalemailaddress',
      'isdisabled',
      'createdon',
      'modifiedon'
    ]
  },
  queue: {
    entitySetName: 'queues',
    displayName: 'queues',
    defaultSelect: ['queueid', 'name', 'emailaddress', 'statecode', 'createdon', 'modifiedon']
  },
  routing_state: {
    entitySetName: 'msdyn_routingrequests',
    displayName: 'routing state records',
    defaultSelect: [
      'msdyn_routingrequestid',
      'msdyn_name',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  },
  linked_case: {
    entitySetName: 'incidents',
    displayName: 'linked cases',
    defaultSelect: [
      'incidentid',
      'ticketnumber',
      'title',
      'customerid',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  }
};

let resolveResource = (resourceType: ContactCenterResourceType, override?: string) => ({
  ...contactCenterResources[resourceType],
  entitySetName: override?.trim() || contactCenterResources[resourceType].entitySetName
});

let textFromValue = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null) return undefined;
  return JSON.stringify(value, null, 2);
};

let listInputSchema = z.object({
  resourceType: contactCenterResourceTypeSchema.describe(
    'Contact Center record type to query'
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

export let listContactCenterRecords = SlateTool.create(spec, {
  key: 'list_contact_center_records',
  name: 'List Contact Center Records',
  description:
    'List Dynamics 365 Contact Center conversations, sessions, transcripts, agents, queues, routing state records, and linked cases with Dataverse OData query options.',
  tags: { readOnly: true, destructive: false }
})
  .input(listInputSchema)
  .output(
    z.object({
      resourceType: contactCenterResourceTypeSchema,
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
      message: `Retrieved **${page.records.length}** Dynamics 365 Contact Center ${resource.displayName}.`
    };
  })
  .build();

export let getContactCenterRecord = SlateTool.create(spec, {
  key: 'get_contact_center_record',
  name: 'Get Contact Center Record',
  description:
    'Retrieve one Dynamics 365 Contact Center conversation, session, transcript, agent, queue, routing state record, or linked case by Dataverse GUID.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      resourceType: contactCenterResourceTypeSchema.describe('Contact Center record type'),
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
      resourceType: contactCenterResourceTypeSchema,
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
      message: `Retrieved Dynamics 365 Contact Center ${resource.displayName} record **${ctx.input.recordId}**.`
    };
  })
  .build();

export let exportConversationTranscript = SlateTool.create(spec, {
  key: 'export_conversation_transcript',
  name: 'Export Conversation Transcript',
  description:
    'Export transcript text from a Dynamics 365 Contact Center transcript Dataverse record as a Slate text attachment.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      transcriptId: z.string().describe('Transcript record GUID'),
      entitySetNameOverride: z
        .string()
        .optional()
        .describe('Transcript entity set name. Defaults to msdyn_transcripts.'),
      contentColumn: z
        .string()
        .optional()
        .describe('Transcript content column. Defaults to msdyn_transcript.'),
      fileName: z
        .string()
        .optional()
        .describe('Attachment filename. Defaults to transcript-<id>.txt.'),
      mimeType: z
        .string()
        .optional()
        .describe('Attachment MIME type. Defaults to text/plain.'),
      select: z
        .array(z.string())
        .optional()
        .describe('Extra columns to retrieve with the content column.')
    })
  )
  .output(
    z.object({
      transcriptId: z.string(),
      fileName: z.string(),
      mimeType: z.string(),
      sizeBytes: z.number(),
      attachmentCount: z.number()
    })
  )
  .handleInvocation(async ctx => {
    let entitySetName = ctx.input.entitySetNameOverride?.trim() || 'msdyn_transcripts';
    let contentColumn = ctx.input.contentColumn?.trim() || 'msdyn_transcript';
    let select = [...new Set([contentColumn, ...(ctx.input.select ?? [])])];
    let record = await createDataverseClientFromContext(ctx).getRecord(
      entitySetName,
      ctx.input.transcriptId,
      { select }
    );
    let content = textFromValue(record[contentColumn]);
    if (!content) {
      throw dataverseValidationError(
        `Transcript column ${contentColumn} did not contain exportable content.`
      );
    }

    let fileName = ctx.input.fileName ?? `transcript-${ctx.input.transcriptId}.txt`;
    let mimeType = ctx.input.mimeType ?? 'text/plain';

    return {
      output: {
        transcriptId: ctx.input.transcriptId,
        fileName,
        mimeType,
        sizeBytes: Buffer.byteLength(content, 'utf8'),
        attachmentCount: 1
      },
      message: `Exported transcript **${ctx.input.transcriptId}**.`,
      attachments: [createTextAttachment(content, mimeType)]
    };
  })
  .build();
