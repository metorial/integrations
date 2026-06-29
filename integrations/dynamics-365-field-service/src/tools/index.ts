import {
  createDataverseClientFromContext,
  dataverseValidationError
} from '@slates/microsoft-dataverse-recipes';
import { SlateTool, setIfDefined } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';

let recordSchema = z.record(z.string(), z.any());

let fieldServiceResourceTypes = [
  'work_order',
  'booking',
  'resource',
  'customer_asset',
  'service_account',
  'incident_type',
  'product',
  'service'
] as const;

let fieldServiceResourceTypeSchema = z.enum(fieldServiceResourceTypes);
type FieldServiceResourceType = z.infer<typeof fieldServiceResourceTypeSchema>;

let fieldServiceResources: Record<
  FieldServiceResourceType,
  { entitySetName: string; displayName: string; defaultSelect: string[] }
> = {
  work_order: {
    entitySetName: 'msdyn_workorders',
    displayName: 'work orders',
    defaultSelect: [
      'msdyn_workorderid',
      'msdyn_name',
      'msdyn_systemstatus',
      'msdyn_serviceaccount',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  },
  booking: {
    entitySetName: 'bookableresourcebookings',
    displayName: 'bookings',
    defaultSelect: [
      'bookableresourcebookingid',
      'name',
      'starttime',
      'endtime',
      'resource',
      'bookingstatus',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  },
  resource: {
    entitySetName: 'bookableresources',
    displayName: 'bookable resources',
    defaultSelect: [
      'bookableresourceid',
      'name',
      'resourcetype',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  },
  customer_asset: {
    entitySetName: 'msdyn_customerassets',
    displayName: 'customer assets',
    defaultSelect: [
      'msdyn_customerassetid',
      'msdyn_name',
      'msdyn_account',
      'msdyn_product',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  },
  service_account: {
    entitySetName: 'accounts',
    displayName: 'service accounts',
    defaultSelect: [
      'accountid',
      'name',
      'accountnumber',
      'telephone1',
      'address1_city',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  },
  incident_type: {
    entitySetName: 'msdyn_incidenttypes',
    displayName: 'incident types',
    defaultSelect: [
      'msdyn_incidenttypeid',
      'msdyn_name',
      'msdyn_estimatedduration',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  },
  product: {
    entitySetName: 'products',
    displayName: 'products',
    defaultSelect: [
      'productid',
      'name',
      'productnumber',
      'price',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  },
  service: {
    entitySetName: 'services',
    displayName: 'services',
    defaultSelect: [
      'serviceid',
      'name',
      'duration',
      'statecode',
      'statuscode',
      'createdon',
      'modifiedon'
    ]
  }
};

let workOrderSystemStatuses = {
  unscheduled: 690970000,
  scheduled: 690970001,
  in_progress: 690970002,
  completed: 690970003,
  posted: 690970004,
  canceled: 690970005
} as const;

let workOrderLifecycleStatusByAction = {
  mark_unscheduled: workOrderSystemStatuses.unscheduled,
  mark_scheduled: workOrderSystemStatuses.scheduled,
  mark_in_progress: workOrderSystemStatuses.in_progress,
  mark_completed: workOrderSystemStatuses.completed,
  mark_posted: workOrderSystemStatuses.posted,
  cancel: workOrderSystemStatuses.canceled
} as const;

let resolveResource = (resourceType: FieldServiceResourceType, override?: string) => ({
  ...fieldServiceResources[resourceType],
  entitySetName: override?.trim() || fieldServiceResources[resourceType].entitySetName
});

let requireText = (value: string | undefined, label: string) => {
  if (!value?.trim()) {
    throw dataverseValidationError(`${label} is required.`);
  }

  return value.trim();
};

let hasKeys = (value: Record<string, unknown>) => Object.keys(value).length > 0;

let bind = (navigationProperty: string, entitySetName: string, recordId: string) =>
  `/${entitySetName}(${requireText(recordId, `${navigationProperty} record ID`)})`;

let listInputSchema = z.object({
  resourceType: fieldServiceResourceTypeSchema.describe('Field Service record type to query'),
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
  resourceType: fieldServiceResourceTypeSchema.describe('Field Service record type'),
  entitySetNameOverride: z
    .string()
    .optional()
    .describe('Override the default Dataverse entity set name.'),
  recordId: z.string().describe('Dataverse record GUID'),
  select: z.array(z.string()).optional().describe('Columns to return'),
  expand: z.string().optional().describe('OData $expand expression')
});

export let listFieldServiceRecords = SlateTool.create(spec, {
  key: 'list_field_service_records',
  name: 'List Field Service Records',
  description:
    'List Dynamics 365 Field Service work orders, bookings, resources, customer assets, service accounts, incident types, products, and services with Dataverse OData query options.',
  tags: { readOnly: true, destructive: false }
})
  .input(listInputSchema)
  .output(
    z.object({
      resourceType: fieldServiceResourceTypeSchema,
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
      message: `Retrieved **${page.records.length}** Dynamics 365 Field Service ${resource.displayName}.`
    };
  })
  .build();

export let getFieldServiceRecord = SlateTool.create(spec, {
  key: 'get_field_service_record',
  name: 'Get Field Service Record',
  description:
    'Retrieve one Dynamics 365 Field Service work order, booking, resource, customer asset, service account, incident type, product, or service by Dataverse GUID.',
  tags: { readOnly: true, destructive: false }
})
  .input(recordRefInput)
  .output(
    z.object({
      resourceType: fieldServiceResourceTypeSchema,
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
      message: `Retrieved Dynamics 365 Field Service ${resource.displayName} record **${ctx.input.recordId}**.`
    };
  })
  .build();

export let createFieldServiceRecord = SlateTool.create(spec, {
  key: 'create_field_service_record',
  name: 'Create Field Service Record',
  description:
    'Create a Dynamics 365 Field Service work order, booking, resource, customer asset, service account, incident type, product, or service record.',
  tags: { readOnly: false, destructive: false }
})
  .input(
    z.object({
      resourceType: fieldServiceResourceTypeSchema.describe(
        'Field Service record type to create'
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
      resourceType: fieldServiceResourceTypeSchema,
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
      message: `Created a Dynamics 365 Field Service ${resource.displayName} record.`
    };
  })
  .build();

export let updateFieldServiceRecord = SlateTool.create(spec, {
  key: 'update_field_service_record',
  name: 'Update Field Service Record',
  description:
    'Update selected columns on a Dynamics 365 Field Service work order, booking, resource, customer asset, service account, incident type, product, or service.',
  tags: { readOnly: false, destructive: false }
})
  .input(
    z.object({
      resourceType: fieldServiceResourceTypeSchema.describe(
        'Field Service record type to update'
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
      resourceType: fieldServiceResourceTypeSchema,
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
      message: `Updated Dynamics 365 Field Service ${resource.displayName} record **${ctx.input.recordId}**.`
    };
  })
  .build();

export let scheduleBooking = SlateTool.create(spec, {
  key: 'schedule_booking',
  name: 'Schedule Booking',
  description:
    'Create a Dynamics 365 Field Service bookable resource booking for a work order with typed resource and time fields.',
  tags: { readOnly: false, destructive: false }
})
  .input(
    z.object({
      workOrderId: z.string().describe('Work order GUID to schedule'),
      resourceId: z.string().describe('Bookable resource GUID'),
      startTime: z.string().describe('Booking start timestamp'),
      endTime: z.string().describe('Booking end timestamp'),
      bookingStatusId: z.string().optional().describe('Optional booking status GUID'),
      name: z.string().optional().describe('Booking name'),
      workOrderNavigationProperty: z
        .string()
        .optional()
        .describe('Work order lookup navigation property. Defaults to msdyn_WorkOrder.'),
      resourceNavigationProperty: z
        .string()
        .optional()
        .describe('Resource lookup navigation property. Defaults to Resource.'),
      bookingStatusNavigationProperty: z
        .string()
        .optional()
        .describe('Booking status lookup navigation property. Defaults to BookingStatus.'),
      additionalFields: recordSchema
        .optional()
        .describe('Additional bookable resource booking columns.')
    })
  )
  .output(
    z.object({
      bookingId: z.string().optional(),
      record: recordSchema
    })
  )
  .handleInvocation(async ctx => {
    let data: Record<string, unknown> = { ...(ctx.input.additionalFields ?? {}) };
    setIfDefined(data, 'name', ctx.input.name);
    data.starttime = requireText(ctx.input.startTime, 'startTime');
    data.endtime = requireText(ctx.input.endTime, 'endTime');
    data[`${ctx.input.workOrderNavigationProperty ?? 'msdyn_WorkOrder'}@odata.bind`] = bind(
      ctx.input.workOrderNavigationProperty ?? 'msdyn_WorkOrder',
      'msdyn_workorders',
      ctx.input.workOrderId
    );
    data[`${ctx.input.resourceNavigationProperty ?? 'Resource'}@odata.bind`] = bind(
      ctx.input.resourceNavigationProperty ?? 'Resource',
      'bookableresources',
      ctx.input.resourceId
    );
    if (ctx.input.bookingStatusId) {
      data[`${ctx.input.bookingStatusNavigationProperty ?? 'BookingStatus'}@odata.bind`] =
        bind(
          ctx.input.bookingStatusNavigationProperty ?? 'BookingStatus',
          'bookingstatuses',
          ctx.input.bookingStatusId
        );
    }

    let record = await createDataverseClientFromContext(ctx).createRecord(
      'bookableresourcebookings',
      data,
      { returnRepresentation: true }
    );

    return {
      output: {
        bookingId:
          typeof record.bookableresourcebookingid === 'string'
            ? record.bookableresourcebookingid
            : undefined,
        record
      },
      message: 'Scheduled a Dynamics 365 Field Service booking.'
    };
  })
  .build();

export let updateBooking = SlateTool.create(spec, {
  key: 'update_booking',
  name: 'Update Booking',
  description:
    'Update a Dynamics 365 Field Service bookable resource booking time, resource, status, or custom fields.',
  tags: { readOnly: false, destructive: false }
})
  .input(
    z.object({
      bookingId: z.string().describe('Bookable resource booking GUID'),
      resourceId: z.string().optional().describe('New bookable resource GUID'),
      startTime: z.string().optional().describe('New booking start timestamp'),
      endTime: z.string().optional().describe('New booking end timestamp'),
      bookingStatusId: z.string().optional().describe('New booking status GUID'),
      resourceNavigationProperty: z
        .string()
        .optional()
        .describe('Resource lookup navigation property. Defaults to Resource.'),
      bookingStatusNavigationProperty: z
        .string()
        .optional()
        .describe('Booking status lookup navigation property. Defaults to BookingStatus.'),
      additionalFields: recordSchema
        .optional()
        .describe('Additional booking columns to update.')
    })
  )
  .output(
    z.object({
      bookingId: z.string(),
      record: recordSchema
    })
  )
  .handleInvocation(async ctx => {
    let data: Record<string, unknown> = { ...(ctx.input.additionalFields ?? {}) };
    setIfDefined(data, 'starttime', ctx.input.startTime);
    setIfDefined(data, 'endtime', ctx.input.endTime);
    if (ctx.input.resourceId) {
      data[`${ctx.input.resourceNavigationProperty ?? 'Resource'}@odata.bind`] = bind(
        ctx.input.resourceNavigationProperty ?? 'Resource',
        'bookableresources',
        ctx.input.resourceId
      );
    }
    if (ctx.input.bookingStatusId) {
      data[`${ctx.input.bookingStatusNavigationProperty ?? 'BookingStatus'}@odata.bind`] =
        bind(
          ctx.input.bookingStatusNavigationProperty ?? 'BookingStatus',
          'bookingstatuses',
          ctx.input.bookingStatusId
        );
    }

    if (!hasKeys(data)) {
      throw dataverseValidationError(
        'At least one booking field is required for update_booking.'
      );
    }

    let record = await createDataverseClientFromContext(ctx).updateRecord(
      'bookableresourcebookings',
      ctx.input.bookingId,
      data,
      { returnRepresentation: true }
    );

    return {
      output: {
        bookingId: ctx.input.bookingId,
        record
      },
      message: `Updated Field Service booking **${ctx.input.bookingId}**.`
    };
  })
  .build();

export let manageWorkOrderLifecycle = SlateTool.create(spec, {
  key: 'manage_work_order_lifecycle',
  name: 'Manage Work Order Lifecycle',
  description:
    'Set a Dynamics 365 Field Service work order system status and optional Dataverse state/status fields.',
  tags: { readOnly: false, destructive: false }
})
  .input(
    z.object({
      lifecycleAction: z
        .enum([
          'set_system_status',
          'mark_unscheduled',
          'mark_scheduled',
          'mark_in_progress',
          'mark_completed',
          'mark_posted',
          'cancel'
        ])
        .describe('Work order lifecycle operation to perform'),
      workOrderId: z.string().describe('Work order GUID'),
      systemStatus: z
        .number()
        .int()
        .optional()
        .describe('Field Service msdyn_systemstatus value. Required for set_system_status.'),
      stateCode: z.number().int().optional().describe('Optional Dataverse statecode to set'),
      statusCode: z.number().int().optional().describe('Optional Dataverse statuscode to set'),
      additionalFields: recordSchema
        .optional()
        .describe('Additional work order columns to update.')
    })
  )
  .output(
    z.object({
      lifecycleAction: z.string(),
      workOrderId: z.string(),
      record: recordSchema
    })
  )
  .handleInvocation(async ctx => {
    let systemStatus = ctx.input.systemStatus;
    if (ctx.input.lifecycleAction !== 'set_system_status') {
      systemStatus = workOrderLifecycleStatusByAction[ctx.input.lifecycleAction];
    }
    if (systemStatus === undefined) {
      throw dataverseValidationError(
        'systemStatus is required when lifecycleAction is set_system_status.'
      );
    }

    let data: Record<string, unknown> = {
      ...(ctx.input.additionalFields ?? {}),
      msdyn_systemstatus: systemStatus
    };
    setIfDefined(data, 'statecode', ctx.input.stateCode);
    setIfDefined(data, 'statuscode', ctx.input.statusCode);

    let record = await createDataverseClientFromContext(ctx).updateRecord(
      'msdyn_workorders',
      ctx.input.workOrderId,
      data,
      { returnRepresentation: true }
    );

    return {
      output: {
        lifecycleAction: ctx.input.lifecycleAction,
        workOrderId: ctx.input.workOrderId,
        record
      },
      message: `Updated Field Service work order **${ctx.input.workOrderId}** lifecycle.`
    };
  })
  .build();
