import { SlateTool } from 'slates';
import { z } from 'zod';
import { finagoServiceError, requireInput } from '../lib/errors';
import { createClientFromContext } from '../lib/helpers';
import {
  getNumber,
  getString,
  isRecord,
  mergeAdditionalFields,
  objectWithDefined
} from '../lib/records';
import { spec } from '../spec';
import { additionalFieldsSchema, dimensionsSchema, maxPagesSchema } from './shared';

let salesOrderSchema = z.object({
  salesOrderId: z.number().optional().describe('Finago sales order ID.'),
  status: z.string().optional().describe('Sales order status.'),
  customerId: z.number().optional().describe('Customer ID.'),
  customerName: z.string().optional().describe('Customer name.'),
  date: z.string().optional().describe('Sales order date.'),
  invoiceNumber: z.number().optional().describe('Invoice number when invoiced.'),
  grossAmount: z.number().optional().describe('Gross order amount.'),
  netAmount: z.number().optional().describe('Net order amount.'),
  taxAmount: z.number().optional().describe('Tax amount.'),
  lines: z.array(z.unknown()).optional().describe('Sales order lines, when requested.'),
  attachments: z
    .array(z.unknown())
    .optional()
    .describe('Sales order attachment metadata, when requested.'),
  record: z.unknown().describe('Raw Finago sales order record.')
});

let lineSchema = z.object({
  type: z
    .enum(['product', 'text'])
    .optional()
    .describe('Line type. Use product when productId or productNumber is supplied.'),
  productId: z.number().int().positive().optional().describe('Product ID for product lines.'),
  productNumber: z.string().optional().describe('Product number for product lines.'),
  description: z.string().optional().describe('Line description.'),
  quantity: z.number().optional().describe('Quantity.'),
  price: z.number().optional().describe('Unit price.'),
  costPrice: z.number().optional().describe('Cost price.'),
  discountRate: z.number().min(0).max(100).optional().describe('Discount percentage.'),
  taxId: z.number().int().positive().optional().describe('Tax ID.'),
  taxNumber: z.number().int().min(0).optional().describe('Tax code number.'),
  accountId: z.number().int().positive().optional().describe('Revenue account ID.'),
  accountNumber: z.number().int().positive().optional().describe('Revenue account number.'),
  dimensions: dimensionsSchema,
  additionalFields: additionalFieldsSchema
});

let nestedRecord = (record: unknown, key: string) =>
  isRecord(record) && isRecord(record[key]) ? record[key] : undefined;

let nestedNumber = (record: unknown, parent: string, key: string) => {
  let child = nestedRecord(record, parent);
  return isRecord(child) && typeof child[key] === 'number' ? child[key] : undefined;
};

let nestedString = (record: unknown, parent: string, key: string) => {
  let child = nestedRecord(record, parent);
  return isRecord(child) && typeof child[key] === 'string' ? child[key] : undefined;
};

let mapSalesOrder = (
  record: unknown,
  lines?: unknown[],
  attachments?: unknown[]
): z.infer<typeof salesOrderSchema> => ({
  salesOrderId: getNumber(record, 'id'),
  status: getString(record, 'status'),
  customerId: nestedNumber(record, 'customer', 'id'),
  customerName: nestedString(record, 'customer', 'name'),
  date: getString(record, 'date'),
  invoiceNumber: nestedNumber(record, 'invoice', 'number'),
  grossAmount: getNumber(record, 'grossAmount'),
  netAmount: getNumber(record, 'netAmount'),
  taxAmount: getNumber(record, 'taxAmount'),
  lines,
  attachments,
  record
});

let salesOrderBody = (input: {
  customerId?: number;
  customerName?: string;
  customerOrganizationNumber?: string;
  customerInvoiceEmailAddresses?: string[];
  status?: string;
  date?: string;
  deliveryDate?: string;
  currencyCode?: string;
  currencyRate?: number;
  memo?: string;
  internalMemo?: string;
  referenceNumber?: string;
  paymentMethodId?: number | null;
  salesTypeId?: number;
  invoiceDate?: string;
  invoiceDueDate?: string;
  invoiceDistributionMethod?: string;
  invoiceRemittanceReference?: string;
  dimensions?: Array<{ dimensionType: number; value: string; name?: string }>;
  additionalFields?: Record<string, unknown>;
}) => {
  let body: Record<string, unknown> = objectWithDefined({
    status: input.status,
    date: input.date,
    deliveryDate: input.deliveryDate,
    memo: input.memo,
    internalMemo: input.internalMemo,
    referenceNumber: input.referenceNumber,
    dimensions: input.dimensions
  });

  if (input.customerId !== undefined || input.customerName !== undefined) {
    body.customer = objectWithDefined({
      id: input.customerId,
      name: input.customerName,
      organizationNumber: input.customerOrganizationNumber,
      invoiceEmailAddresses: input.customerInvoiceEmailAddresses
    });
  }

  if (input.currencyCode !== undefined || input.currencyRate !== undefined) {
    body.currency = objectWithDefined({
      code: input.currencyCode,
      rate: input.currencyRate
    });
  }

  if (input.paymentMethodId !== undefined) {
    body.paymentMethod = { id: input.paymentMethodId };
  }

  if (input.salesTypeId !== undefined) {
    body.salesType = { id: input.salesTypeId };
  }

  if (
    input.invoiceDate !== undefined ||
    input.invoiceDueDate !== undefined ||
    input.invoiceDistributionMethod !== undefined ||
    input.invoiceRemittanceReference !== undefined
  ) {
    body.invoice = objectWithDefined({
      date: input.invoiceDate,
      dueDate: input.invoiceDueDate,
      distributionMethod: input.invoiceDistributionMethod,
      remittanceReference: input.invoiceRemittanceReference
    });
  }

  return mergeAdditionalFields(body, input.additionalFields);
};

let salesOrderLineBody = (line: z.infer<typeof lineSchema>) => {
  let type =
    line.type ?? (line.productId !== undefined || line.productNumber ? 'product' : 'text');
  if (type === 'product' && line.productId === undefined && !line.productNumber) {
    throw finagoServiceError(
      'productId or productNumber is required for product sales order lines.'
    );
  }
  if (type === 'text' && !line.description) {
    throw finagoServiceError('description is required for text sales order lines.');
  }

  let body: Record<string, unknown> = objectWithDefined({
    type,
    description: line.description,
    quantity: line.quantity,
    price: line.price,
    costPrice: line.costPrice,
    discountRate: line.discountRate,
    dimensions: line.dimensions
  });

  if (line.productId !== undefined || line.productNumber !== undefined) {
    body.product = objectWithDefined({
      id: line.productId,
      number: line.productNumber
    });
  }

  if (line.taxId !== undefined || line.taxNumber !== undefined) {
    body.tax = objectWithDefined({
      id: line.taxId,
      number: line.taxNumber
    });
  }

  if (line.accountId !== undefined || line.accountNumber !== undefined) {
    body.account = objectWithDefined({
      id: line.accountId,
      number: line.accountNumber
    });
  }

  return mergeAdditionalFields(body, line.additionalFields);
};

export let finagoListSalesOrders = SlateTool.create(spec, {
  name: 'List Sales Orders',
  key: 'finago_list_sales_orders',
  description:
    'List Finago sales orders with date, status, customer, invoice, created, and modified filters. Can optionally include lines and attachment metadata for returned orders.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      limit: z.number().int().positive().optional().describe('Page size.'),
      continuationToken: z
        .string()
        .optional()
        .describe('Continuation token from a Link header.'),
      date: z.string().optional().describe('Exact sales order date.'),
      dateFrom: z.string().optional().describe('Start sales order date.'),
      dateTo: z.string().optional().describe('End sales order date.'),
      status: z
        .enum(['Draft', 'Web', 'Proposal', 'Confirmed', 'Invoice', 'AdvanceInvoice'])
        .optional()
        .describe('Sales order status filter.'),
      customerId: z.string().optional().describe('Customer ID filter.'),
      invoiceNumber: z.string().optional().describe('Invoice number filter.'),
      createdFrom: z.string().optional().describe('Created timestamp lower bound.'),
      createdTo: z.string().optional().describe('Created timestamp upper bound.'),
      modifiedFrom: z.string().optional().describe('Modified timestamp lower bound.'),
      modifiedTo: z.string().optional().describe('Modified timestamp upper bound.'),
      includeLines: z.boolean().optional().describe('Fetch lines for each returned order.'),
      includeAttachments: z
        .boolean()
        .optional()
        .describe('Fetch attachment metadata for each returned order.'),
      maxPages: maxPagesSchema
    })
  )
  .output(
    z.object({
      salesOrders: z.array(salesOrderSchema),
      count: z.number(),
      pageCount: z.number().optional(),
      hasNextPage: z.boolean().optional(),
      nextLink: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);
    let result = await client.list(
      '/salesorders',
      {
        limit: ctx.input.limit,
        continuationToken: ctx.input.continuationToken,
        date: ctx.input.date,
        dateFrom: ctx.input.dateFrom,
        dateTo: ctx.input.dateTo,
        status: ctx.input.status,
        customerId: ctx.input.customerId,
        invoiceNumber: ctx.input.invoiceNumber,
        createdFrom: ctx.input.createdFrom,
        createdTo: ctx.input.createdTo,
        modifiedFrom: ctx.input.modifiedFrom,
        modifiedTo: ctx.input.modifiedTo
      },
      ctx.input.maxPages ?? 1,
      'list sales orders'
    );

    let salesOrders = await Promise.all(
      result.records.map(async record => {
        let id = getNumber(record, 'id');
        let lines =
          ctx.input.includeLines && id !== undefined
            ? (
                await client.list(
                  `/salesorders/${id}/lines`,
                  undefined,
                  1,
                  'list sales order lines'
                )
              ).records
            : undefined;
        let attachments =
          ctx.input.includeAttachments && id !== undefined
            ? (
                await client.list(
                  `/salesorders/${id}/attachments`,
                  undefined,
                  1,
                  'list sales order attachments'
                )
              ).records
            : undefined;
        return mapSalesOrder(record, lines, attachments);
      })
    );

    return {
      output: {
        salesOrders,
        count: salesOrders.length,
        pageCount: result.pageCount,
        hasNextPage: result.hasNextPage,
        nextLink: result.nextLink
      },
      message: `Retrieved **${salesOrders.length}** Finago sales order(s).`
    };
  })
  .build();

export let finagoGetSalesOrder = SlateTool.create(spec, {
  name: 'Get Sales Order',
  key: 'finago_get_sales_order',
  description:
    'Read one Finago sales order by ID with optional line items and attachment metadata.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      salesOrderId: z.number().int().positive().describe('Finago sales order ID.'),
      includeLines: z.boolean().optional().describe('Also fetch sales order lines.'),
      includeAttachments: z.boolean().optional().describe('Also fetch attachment metadata.')
    })
  )
  .output(salesOrderSchema)
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);
    let record = await client.get(
      `/salesorders/${ctx.input.salesOrderId}`,
      undefined,
      'read sales order'
    );
    let lines = ctx.input.includeLines
      ? (
          await client.list(
            `/salesorders/${ctx.input.salesOrderId}/lines`,
            undefined,
            1,
            'list sales order lines'
          )
        ).records
      : undefined;
    let attachments = ctx.input.includeAttachments
      ? (
          await client.list(
            `/salesorders/${ctx.input.salesOrderId}/attachments`,
            undefined,
            1,
            'list sales order attachments'
          )
        ).records
      : undefined;
    let output = mapSalesOrder(record, lines, attachments);

    return {
      output,
      message: `Retrieved Finago sales order **${ctx.input.salesOrderId}**.`
    };
  })
  .build();

export let finagoCreateSalesOrder = SlateTool.create(spec, {
  name: 'Create Sales Order',
  key: 'finago_create_sales_order',
  description:
    'Create a Finago sales order and optionally add line items. The order is created before lines are added, so a later line failure can leave a draft order without all intended lines.',
  constraints: [
    'customerId and customerName are required because Finago snapshots customer details onto sales orders.',
    'Line creation happens after order creation.'
  ],
  tags: { readOnly: false, destructive: false }
})
  .input(
    z.object({
      customerId: z.number().int().positive().describe('Customer ID.'),
      customerName: z.string().describe('Customer name to snapshot onto the order.'),
      customerOrganizationNumber: z
        .string()
        .optional()
        .describe('Customer organization number.'),
      customerInvoiceEmailAddresses: z
        .array(z.string())
        .optional()
        .describe('Invoice recipient email addresses.'),
      status: z
        .enum(['Draft', 'Web', 'Proposal', 'Confirmed'])
        .optional()
        .describe('Initial sales order status. Defaults to Finago behavior.'),
      date: z.string().optional().describe('Sales order date.'),
      deliveryDate: z.string().optional().describe('Delivery date.'),
      currencyCode: z.string().optional().describe('Currency code.'),
      currencyRate: z.number().optional().describe('Currency exchange rate.'),
      memo: z.string().optional().describe('Customer-visible memo.'),
      internalMemo: z.string().optional().describe('Internal memo.'),
      referenceNumber: z.string().optional().describe('Customer reference or PO number.'),
      paymentMethodId: z
        .number()
        .int()
        .positive()
        .optional()
        .describe('Payment method ID from reference data.'),
      salesTypeId: z.number().int().optional().describe('Sales type ID.'),
      invoiceDate: z.string().optional().describe('Invoice date if invoice info is supplied.'),
      invoiceDueDate: z.string().optional().describe('Invoice due date.'),
      invoiceDistributionMethod: z
        .string()
        .optional()
        .describe('Invoice distribution method.'),
      invoiceRemittanceReference: z
        .string()
        .optional()
        .describe('Invoice remittance reference.'),
      dimensions: dimensionsSchema,
      lines: z
        .array(lineSchema)
        .optional()
        .describe('Sales order lines to add after creation.'),
      additionalFields: additionalFieldsSchema
    })
  )
  .output(
    salesOrderSchema.extend({
      lineCount: z.number().describe('Number of lines added by this call.')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);
    let order = await client.post(
      '/salesorders',
      salesOrderBody(ctx.input),
      undefined,
      'create sales order'
    );
    let salesOrderId = getNumber(order, 'id');
    if (salesOrderId === undefined) {
      throw finagoServiceError('Finago did not return a sales order ID.');
    }

    let lines: unknown[] = [];
    for (let line of ctx.input.lines ?? []) {
      lines.push(
        await client.post(
          `/salesorders/${salesOrderId}/lines`,
          salesOrderLineBody(line),
          undefined,
          'create sales order line'
        )
      );
    }

    let output = {
      ...mapSalesOrder(order, lines.length > 0 ? lines : undefined),
      lineCount: lines.length
    };

    return {
      output,
      message: `Created Finago sales order **${salesOrderId}** with **${lines.length}** line(s).`
    };
  })
  .build();

export let finagoInvoiceSalesOrder = SlateTool.create(spec, {
  name: 'Invoice Sales Order',
  key: 'finago_invoice_sales_order',
  description:
    'Convert an existing Finago sales order to invoice status by patching its status to Invoice. The sales order must already contain at least one line.',
  constraints: [
    'This is customer-facing and can trigger Finago invoice handling.',
    'confirm must be true.'
  ],
  tags: { readOnly: false, destructive: true }
})
  .input(
    z.object({
      salesOrderId: z.number().int().positive().describe('Finago sales order ID.'),
      confirm: z
        .boolean()
        .describe('Must be true to confirm changing the sales order status to Invoice.'),
      invoiceDate: z.string().optional().describe('Optional invoice date.'),
      invoiceDueDate: z.string().optional().describe('Optional invoice due date.'),
      invoiceDistributionMethod: z
        .string()
        .optional()
        .describe('Optional distribution method.'),
      invoiceRemittanceReference: z
        .string()
        .optional()
        .describe('Optional remittance reference.'),
      additionalFields: additionalFieldsSchema
    })
  )
  .output(salesOrderSchema)
  .handleInvocation(async ctx => {
    requireInput(ctx.input.salesOrderId, 'salesOrderId');
    if (ctx.input.confirm !== true) {
      throw finagoServiceError('confirm must be true to invoice a sales order.');
    }

    let client = createClientFromContext(ctx);
    let record = await client.patch(
      `/salesorders/${ctx.input.salesOrderId}`,
      salesOrderBody({
        status: 'Invoice',
        invoiceDate: ctx.input.invoiceDate,
        invoiceDueDate: ctx.input.invoiceDueDate,
        invoiceDistributionMethod: ctx.input.invoiceDistributionMethod,
        invoiceRemittanceReference: ctx.input.invoiceRemittanceReference,
        additionalFields: ctx.input.additionalFields
      }),
      undefined,
      'invoice sales order'
    );
    let output = mapSalesOrder(record);

    return {
      output,
      message: `Changed Finago sales order **${ctx.input.salesOrderId}** to invoice status.`
    };
  })
  .build();
