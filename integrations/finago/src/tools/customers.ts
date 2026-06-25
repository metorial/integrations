import { SlateTool } from 'slates';
import { z } from 'zod';
import { finagoServiceError, requireInput, requireUpdateFields } from '../lib/errors';
import { createClientFromContext } from '../lib/helpers';
import {
  getNumber,
  getString,
  isRecord,
  mergeAdditionalFields,
  objectWithDefined
} from '../lib/records';
import { spec } from '../spec';
import { additionalFieldsSchema, addressSchema, maxPagesSchema } from './shared';

let customerSchema = z.object({
  customerId: z.number().optional().describe('Finago customer ID.'),
  name: z.string().optional().describe('Customer name.'),
  isCompany: z.boolean().optional().describe('Whether this customer is a company.'),
  isSupplier: z.boolean().optional().describe('Whether this customer is also a supplier.'),
  organizationNumber: z.string().optional().describe('Organization number.'),
  emailContact: z.string().optional().describe('Contact email address.'),
  emailBilling: z.string().optional().describe('Billing email address.'),
  phone: z.string().optional().describe('Phone number.'),
  mobilePhone: z.string().optional().describe('Mobile phone number.'),
  createdAt: z.string().optional().describe('Created timestamp.'),
  modifiedAt: z.string().optional().describe('Modified timestamp.'),
  record: z.unknown().describe('Raw Finago customer record.')
});

let nestedString = (record: unknown, parent: string, key: string) => {
  if (!isRecord(record) || !isRecord(record[parent])) return undefined;
  let value = record[parent][key];
  return typeof value === 'string' ? value : undefined;
};

let mapCustomer = (record: unknown) => ({
  customerId: getNumber(record, 'id'),
  name: getString(record, 'name'),
  isCompany:
    isRecord(record) && typeof record.isCompany === 'boolean' ? record.isCompany : undefined,
  isSupplier:
    isRecord(record) && typeof record.isSupplier === 'boolean' ? record.isSupplier : undefined,
  organizationNumber: getString(record, 'organizationNumber'),
  emailContact: nestedString(record, 'email', 'contact'),
  emailBilling: nestedString(record, 'email', 'billing'),
  phone: getString(record, 'phone'),
  mobilePhone: getString(record, 'mobilePhone'),
  createdAt: getString(record, 'createdAt'),
  modifiedAt: getString(record, 'modifiedAt'),
  record
});

let customerBody = (input: {
  isCompany?: boolean;
  name?: string;
  organizationNumber?: string;
  firstName?: string;
  lastName?: string;
  externalReference?: string;
  isSupplier?: boolean;
  visitAddress?: z.infer<typeof addressSchema>;
  postalAddress?: z.infer<typeof addressSchema>;
  billingAddress?: z.infer<typeof addressSchema>;
  deliveryAddress?: z.infer<typeof addressSchema>;
  emailContact?: string;
  emailBilling?: string;
  phone?: string;
  mobilePhone?: string;
  additionalFields?: Record<string, unknown>;
}) => {
  let body: Record<string, unknown> = objectWithDefined({
    isCompany: input.isCompany,
    name: input.name,
    organizationNumber: input.organizationNumber,
    externalReference: input.externalReference,
    isSupplier: input.isSupplier,
    phone: input.phone,
    mobilePhone: input.mobilePhone
  });

  if (input.firstName !== undefined || input.lastName !== undefined) {
    body.person = objectWithDefined({
      firstName: input.firstName,
      lastName: input.lastName
    });
  }

  if (
    input.visitAddress ||
    input.postalAddress ||
    input.billingAddress ||
    input.deliveryAddress
  ) {
    body.address = objectWithDefined({
      visit: input.visitAddress,
      postal: input.postalAddress,
      billing: input.billingAddress,
      delivery: input.deliveryAddress
    });
  }

  if (input.emailContact !== undefined || input.emailBilling !== undefined) {
    body.email = objectWithDefined({
      contact: input.emailContact,
      billing: input.emailBilling
    });
  }

  return mergeAdditionalFields(body, input.additionalFields);
};

export let finagoListCustomers = SlateTool.create(spec, {
  name: 'List Customers',
  key: 'finago_list_customers',
  description:
    'List Finago customers and suppliers with filters for organization number, company/person, created or modified timestamp, sorting, and pagination.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      customerId: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Read one customer by ID instead of listing customers.'),
      limit: z.number().int().min(1).max(100).optional().describe('Page size.'),
      organizationNumber: z.string().optional().describe('Filter by organization number.'),
      isCompany: z.boolean().optional().describe('Filter companies or private persons.'),
      isSupplier: z.boolean().optional().describe('Filter customers that are also suppliers.'),
      modifiedFrom: z.string().optional().describe('Filter by modified timestamp.'),
      createdFrom: z.string().optional().describe('Filter by created timestamp.'),
      sortBy: z
        .string()
        .optional()
        .describe('Sort expression such as name:asc, createdAt:desc, or id:asc.'),
      maxPages: maxPagesSchema
    })
  )
  .output(
    z.object({
      customers: z.array(customerSchema).describe('Customers returned by Finago.'),
      count: z.number().describe('Number of customers returned.'),
      pageCount: z.number().optional(),
      hasNextPage: z.boolean().optional(),
      nextLink: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);
    let result =
      ctx.input.customerId !== undefined
        ? {
            records: [
              await client.get(
                `/customers/${ctx.input.customerId}`,
                undefined,
                'read customer'
              )
            ],
            pageCount: 1,
            hasNextPage: false,
            nextLink: undefined
          }
        : await client.list(
            '/customers',
            {
              limit: ctx.input.limit,
              organizationNumber: ctx.input.organizationNumber,
              isCompany: ctx.input.isCompany,
              isSupplier: ctx.input.isSupplier,
              modifiedFrom: ctx.input.modifiedFrom,
              createdFrom: ctx.input.createdFrom,
              sortBy: ctx.input.sortBy
            },
            ctx.input.maxPages ?? 1,
            'list customers'
          );
    let customers = result.records.map(mapCustomer);

    return {
      output: {
        customers,
        count: customers.length,
        pageCount: result.pageCount,
        hasNextPage: result.hasNextPage,
        nextLink: result.nextLink
      },
      message: `Retrieved **${customers.length}** Finago customer(s).`
    };
  })
  .build();

export let finagoUpsertCustomer = SlateTool.create(spec, {
  name: 'Upsert Customer',
  key: 'finago_upsert_customer',
  description:
    'Create or update a Finago company/person customer. For create, set isCompany and provide either name for a company or firstName/lastName for a person.',
  tags: { readOnly: false, destructive: false }
})
  .input(
    z.object({
      operation: z.enum(['create', 'update']).describe('Create a new customer or update one.'),
      customerId: z.number().int().positive().optional().describe('Required for update.'),
      isCompany: z.boolean().optional().describe('Required for create. True for company.'),
      name: z.string().optional().describe('Company customer name.'),
      organizationNumber: z.string().optional().describe('Company organization number.'),
      firstName: z.string().optional().describe('Person first name.'),
      lastName: z.string().optional().describe('Person last name.'),
      externalReference: z.string().optional().describe('External system reference.'),
      isSupplier: z.boolean().optional().describe('Whether the customer is also a supplier.'),
      visitAddress: addressSchema.optional().describe('Visiting address.'),
      postalAddress: addressSchema.optional().describe('Postal address.'),
      billingAddress: addressSchema.optional().describe('Billing address.'),
      deliveryAddress: addressSchema.optional().describe('Delivery address.'),
      emailContact: z.string().optional().describe('Contact email address.'),
      emailBilling: z.string().optional().describe('Billing email address.'),
      phone: z.string().optional().describe('Phone number.'),
      mobilePhone: z.string().optional().describe('Mobile phone number.'),
      additionalFields: additionalFieldsSchema
    })
  )
  .output(customerSchema)
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);

    if (ctx.input.operation === 'create') {
      if (ctx.input.isCompany === undefined) {
        throw finagoServiceError('isCompany is required when creating a customer.');
      }
      if (ctx.input.isCompany && !ctx.input.name) {
        throw finagoServiceError('name is required when creating a company customer.');
      }
      if (!ctx.input.isCompany && !ctx.input.firstName && !ctx.input.lastName) {
        throw finagoServiceError(
          'firstName or lastName is required when creating a person customer.'
        );
      }
    }

    if (ctx.input.operation === 'update') {
      requireInput(ctx.input.customerId, 'customerId');
    }

    let body = customerBody(ctx.input);
    if (ctx.input.operation === 'update') {
      let { isCompany: _isCompany, ...updateBody } = body;
      body = updateBody;
      requireUpdateFields(body, 'customer');
    }

    let record =
      ctx.input.operation === 'create'
        ? await client.post('/customers', body, undefined, 'create customer')
        : await client.patch(
            `/customers/${ctx.input.customerId}`,
            body,
            undefined,
            'update customer'
          );
    let output = mapCustomer(record);

    return {
      output,
      message: `${ctx.input.operation === 'create' ? 'Created' : 'Updated'} Finago customer **${output.name ?? output.customerId ?? 'unknown'}**.`
    };
  })
  .build();
