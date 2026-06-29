import {
  createDataverseClientFromContext,
  dataverseValidationError
} from '@slates/microsoft-dataverse-recipes';
import { createBase64Attachment, getBase64ByteLength, SlateTool, setIfDefined } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';

let recordSchema = z.record(z.string(), z.any());

let customerServiceResourceTypes = [
  'case',
  'queue',
  'queue_item',
  'knowledge_article',
  'note',
  'attachment'
] as const;

let customerServiceResourceTypeSchema = z.enum(customerServiceResourceTypes);
type CustomerServiceResourceType = z.infer<typeof customerServiceResourceTypeSchema>;

let customerServiceResources: Record<
  CustomerServiceResourceType,
  { entitySetName: string; displayName: string; defaultSelect: string[] }
> = {
  case: {
    entitySetName: 'incidents',
    displayName: 'cases',
    defaultSelect: [
      'incidentid',
      'ticketnumber',
      'title',
      'customerid',
      'ownerid',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  },
  queue: {
    entitySetName: 'queues',
    displayName: 'queues',
    defaultSelect: ['queueid', 'name', 'emailaddress', 'statecode', 'createdon', 'modifiedon']
  },
  queue_item: {
    entitySetName: 'queueitems',
    displayName: 'queue items',
    defaultSelect: [
      'queueitemid',
      'queueid',
      'objectid',
      'workerid',
      'enteredon',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  },
  knowledge_article: {
    entitySetName: 'knowledgearticles',
    displayName: 'knowledge articles',
    defaultSelect: [
      'knowledgearticleid',
      'title',
      'articlepublicnumber',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  },
  note: {
    entitySetName: 'annotations',
    displayName: 'notes',
    defaultSelect: [
      'annotationid',
      'subject',
      'filename',
      'mimetype',
      'filesize',
      'objectid',
      'createdon',
      'modifiedon'
    ]
  },
  attachment: {
    entitySetName: 'activitymimeattachments',
    displayName: 'attachments',
    defaultSelect: [
      'activitymimeattachmentid',
      'filename',
      'mimetype',
      'filesize',
      'objectid',
      'createdon',
      'modifiedon'
    ]
  }
};

let resolveResource = (resourceType: CustomerServiceResourceType, override?: string) => ({
  ...customerServiceResources[resourceType],
  entitySetName: override?.trim() || customerServiceResources[resourceType].entitySetName
});

let requireText = (value: string | undefined, label: string) => {
  if (!value?.trim()) {
    throw dataverseValidationError(`${label} is required.`);
  }

  return value.trim();
};

let requireNumber = (value: number | undefined, label: string) => {
  if (value === undefined) {
    throw dataverseValidationError(`${label} is required.`);
  }

  return value;
};

let listInputSchema = z.object({
  resourceType: customerServiceResourceTypeSchema.describe(
    'Customer Service record type to query'
  ),
  entitySetNameOverride: z
    .string()
    .optional()
    .describe('Override the default Dataverse entity set name.'),
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

let recordRefInput = z.object({
  resourceType: customerServiceResourceTypeSchema.describe('Customer Service record type'),
  entitySetNameOverride: z
    .string()
    .optional()
    .describe('Override the default Dataverse entity set name.'),
  recordId: z.string().describe('Dataverse record GUID'),
  select: z.array(z.string()).optional().describe('Columns to return'),
  expand: z.string().optional().describe('OData $expand expression')
});

export let listCustomerServiceRecords = SlateTool.create(spec, {
  key: 'list_customer_service_records',
  name: 'List Customer Service Records',
  description:
    'List Dynamics 365 Customer Service cases, queues, queue items, knowledge articles, notes, and attachment metadata with Dataverse OData query options.',
  tags: { readOnly: true, destructive: false }
})
  .input(listInputSchema)
  .output(
    z.object({
      resourceType: customerServiceResourceTypeSchema,
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
      message: `Retrieved **${page.records.length}** Dynamics 365 Customer Service ${resource.displayName}.`
    };
  })
  .build();

export let getCustomerServiceRecord = SlateTool.create(spec, {
  key: 'get_customer_service_record',
  name: 'Get Customer Service Record',
  description:
    'Retrieve one Dynamics 365 Customer Service case, queue, queue item, knowledge article, note, or attachment by Dataverse GUID.',
  tags: { readOnly: true, destructive: false }
})
  .input(recordRefInput)
  .output(
    z.object({
      resourceType: customerServiceResourceTypeSchema,
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
      message: `Retrieved Dynamics 365 Customer Service ${resource.displayName} record **${ctx.input.recordId}**.`
    };
  })
  .build();

export let createCustomerServiceRecord = SlateTool.create(spec, {
  key: 'create_customer_service_record',
  name: 'Create Customer Service Record',
  description:
    'Create a Dynamics 365 Customer Service case, queue item, note, or other supported Customer Service record through Dataverse.',
  tags: { readOnly: false, destructive: false }
})
  .input(
    z.object({
      resourceType: customerServiceResourceTypeSchema.describe(
        'Customer Service record type to create'
      ),
      entitySetNameOverride: z
        .string()
        .optional()
        .describe('Override the default Dataverse entity set name.'),
      recordData: recordSchema.describe(
        'Dataverse column values for the new record, including @odata.bind lookups.'
      ),
      returnRepresentation: z
        .boolean()
        .optional()
        .describe('Whether to return the created record representation. Defaults to true.')
    })
  )
  .output(
    z.object({
      resourceType: customerServiceResourceTypeSchema,
      entitySetName: z.string(),
      record: recordSchema
    })
  )
  .handleInvocation(async ctx => {
    let resource = resolveResource(ctx.input.resourceType, ctx.input.entitySetNameOverride);
    let record = await createDataverseClientFromContext(ctx).createRecord(
      resource.entitySetName,
      ctx.input.recordData,
      {
        returnRepresentation: ctx.input.returnRepresentation
      }
    );

    return {
      output: {
        resourceType: ctx.input.resourceType,
        entitySetName: resource.entitySetName,
        record
      },
      message: `Created a Dynamics 365 Customer Service ${resource.displayName} record.`
    };
  })
  .build();

export let updateCustomerServiceRecord = SlateTool.create(spec, {
  key: 'update_customer_service_record',
  name: 'Update Customer Service Record',
  description:
    'Update selected columns on a Dynamics 365 Customer Service case, queue item, note, or other supported record.',
  tags: { readOnly: false, destructive: false }
})
  .input(
    z.object({
      resourceType: customerServiceResourceTypeSchema.describe(
        'Customer Service record type to update'
      ),
      entitySetNameOverride: z
        .string()
        .optional()
        .describe('Override the default Dataverse entity set name.'),
      recordId: z.string().describe('Dataverse record GUID'),
      recordData: recordSchema.describe(
        'Dataverse column values to patch. Use null to clear nullable columns.'
      ),
      returnRepresentation: z
        .boolean()
        .optional()
        .describe('Whether to return the updated record representation. Defaults to true.')
    })
  )
  .output(
    z.object({
      resourceType: customerServiceResourceTypeSchema,
      entitySetName: z.string(),
      record: recordSchema
    })
  )
  .handleInvocation(async ctx => {
    let resource = resolveResource(ctx.input.resourceType, ctx.input.entitySetNameOverride);
    let record = await createDataverseClientFromContext(ctx).updateRecord(
      resource.entitySetName,
      ctx.input.recordId,
      ctx.input.recordData,
      {
        returnRepresentation: ctx.input.returnRepresentation
      }
    );

    return {
      output: {
        resourceType: ctx.input.resourceType,
        entitySetName: resource.entitySetName,
        record
      },
      message: `Updated Dynamics 365 Customer Service ${resource.displayName} record **${ctx.input.recordId}**.`
    };
  })
  .build();

export let manageCaseWorkflow = SlateTool.create(spec, {
  key: 'manage_case_workflow',
  name: 'Manage Case Workflow',
  description:
    'Resolve, reopen, cancel, or assign a Dynamics 365 Customer Service case with typed Dataverse workflow inputs.',
  tags: { readOnly: false, destructive: false }
})
  .input(
    z.object({
      workflowAction: z
        .enum(['resolve', 'reopen', 'cancel', 'assign'])
        .describe('Case workflow operation to perform'),
      caseId: z.string().describe('Incident/case GUID'),
      statusCode: z
        .number()
        .int()
        .optional()
        .describe('Status reason code. Required for resolve, reopen, and cancel.'),
      subject: z.string().optional().describe('Resolution activity subject for resolve'),
      description: z.string().optional().describe('Resolution description for resolve'),
      actualEnd: z.string().optional().describe('Resolution actual end timestamp for resolve'),
      timeSpentMinutes: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe('Time spent in minutes for resolve'),
      assigneeType: z
        .enum(['systemuser', 'team'])
        .optional()
        .describe('Assignee table for assign. Defaults to systemuser.'),
      assigneeId: z.string().optional().describe('System user or team GUID for assign'),
      additionalFields: recordSchema
        .optional()
        .describe('Additional action body or case update fields for tenant-specific columns.')
    })
  )
  .output(
    z.object({
      workflowAction: z.enum(['resolve', 'reopen', 'cancel', 'assign']),
      caseId: z.string(),
      result: z.any()
    })
  )
  .handleInvocation(async ctx => {
    let client = createDataverseClientFromContext(ctx);
    let caseId = requireText(ctx.input.caseId, 'caseId');

    if (ctx.input.workflowAction === 'resolve') {
      let resolution: Record<string, unknown> = {
        ...(ctx.input.additionalFields ?? {}),
        'incidentid@odata.bind': `/incidents(${caseId})`
      };
      setIfDefined(resolution, 'subject', ctx.input.subject);
      setIfDefined(resolution, 'description', ctx.input.description);
      setIfDefined(resolution, 'actualend', ctx.input.actualEnd);
      setIfDefined(resolution, 'timespent', ctx.input.timeSpentMinutes);

      let result = await client.invokeOperation({
        operationType: 'action',
        operationName: 'CloseIncident',
        requestBody: {
          IncidentResolution: resolution,
          Status: requireNumber(ctx.input.statusCode, 'statusCode')
        }
      });

      return {
        output: { workflowAction: ctx.input.workflowAction, caseId, result: result ?? {} },
        message: `Resolved case **${caseId}**.`
      };
    }

    if (ctx.input.workflowAction === 'assign') {
      let assigneeType = ctx.input.assigneeType ?? 'systemuser';
      let assigneeId = requireText(ctx.input.assigneeId, 'assigneeId');
      let result = await client.invokeOperation({
        operationType: 'action',
        operationName: 'Assign',
        requestBody: {
          ...(ctx.input.additionalFields ?? {}),
          Target: {
            '@odata.type': 'Microsoft.Dynamics.CRM.incident',
            incidentid: caseId
          },
          Assignee: {
            '@odata.type': `Microsoft.Dynamics.CRM.${assigneeType}`,
            [assigneeType === 'team' ? 'teamid' : 'systemuserid']: assigneeId
          }
        }
      });

      return {
        output: { workflowAction: ctx.input.workflowAction, caseId, result: result ?? {} },
        message: `Assigned case **${caseId}**.`
      };
    }

    let statecode = ctx.input.workflowAction === 'reopen' ? 0 : 2;
    let record = await client.updateRecord(
      'incidents',
      caseId,
      {
        ...(ctx.input.additionalFields ?? {}),
        statecode,
        statuscode: requireNumber(ctx.input.statusCode, 'statusCode')
      },
      { returnRepresentation: true }
    );

    return {
      output: { workflowAction: ctx.input.workflowAction, caseId, result: record },
      message: `${ctx.input.workflowAction === 'reopen' ? 'Reopened' : 'Canceled'} case **${caseId}**.`
    };
  })
  .build();

export let downloadNoteAttachment = SlateTool.create(spec, {
  key: 'download_note_attachment',
  name: 'Download Note Attachment',
  description:
    'Download a Dynamics 365 note attachment from an annotation record and return the bytes as a Slate attachment.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      noteId: z.string().describe('Annotation/note GUID'),
      fileName: z
        .string()
        .optional()
        .describe('Fallback attachment filename when the note has no filename'),
      mimeType: z
        .string()
        .optional()
        .describe('Fallback MIME type when the note has no MIME type')
    })
  )
  .output(
    z.object({
      noteId: z.string(),
      fileName: z.string().optional(),
      mimeType: z.string().optional(),
      sizeBytes: z.number(),
      attachmentCount: z.number()
    })
  )
  .handleInvocation(async ctx => {
    let record = await createDataverseClientFromContext(ctx).getRecord(
      'annotations',
      ctx.input.noteId,
      {
        select: ['annotationid', 'filename', 'mimetype', 'filesize', 'documentbody', 'subject']
      }
    );
    let contentBase64 =
      typeof record.documentbody === 'string' ? record.documentbody : undefined;
    if (!contentBase64) {
      throw dataverseValidationError(
        'The annotation does not contain documentbody attachment content.'
      );
    }

    let fileName = typeof record.filename === 'string' ? record.filename : ctx.input.fileName;
    let mimeType = typeof record.mimetype === 'string' ? record.mimetype : ctx.input.mimeType;
    let sizeBytes =
      typeof record.filesize === 'number'
        ? record.filesize
        : getBase64ByteLength(contentBase64);

    return {
      output: {
        noteId: ctx.input.noteId,
        fileName,
        mimeType,
        sizeBytes,
        attachmentCount: 1
      },
      message: `Downloaded note attachment${fileName ? ` **${fileName}**` : ''}.`,
      attachments: [createBase64Attachment(contentBase64, mimeType)]
    };
  })
  .build();
