import { SlateTool } from 'slates';
import { z } from 'zod';
import { finagoServiceError } from '../lib/errors';
import { createClientFromContext } from '../lib/helpers';
import { objectWithDefined } from '../lib/records';
import { spec } from '../spec';
import { dimensionsSchema, maxPagesSchema } from './shared';

let transactionLineInputSchema = z.object({
  accountNumber: z.number().int().positive().describe('General ledger account number.'),
  amount: z
    .number()
    .describe('Line amount. Positive for debit, negative for credit. Lines must balance.'),
  taxNumber: z.number().int().min(0).describe('Tax code number. Use 0 for no tax.'),
  taxAmount: z.number().optional().describe('Explicit tax amount, if needed.'),
  taxBaseRate: z.number().optional().describe('Tax base rate for partial deduction.'),
  taxSpecificationNumber: z.number().int().optional().describe('Tax specification number.'),
  comment: z.string().optional().describe('Line comment.'),
  date: z.string().optional().describe('Line date, if different from transaction date.'),
  periodDate: z.string().optional().describe('Tax period date.'),
  currencyCode: z.string().optional().describe('Currency code for the line.'),
  currencyRate: z.number().optional().describe('Exchange rate to system base currency.'),
  dimensions: dimensionsSchema,
  invoiceNumber: z.string().optional().describe('Related invoice number.'),
  invoiceDueDate: z.string().optional().describe('Related invoice due date.'),
  invoiceRemittanceReference: z.string().optional().describe('Related remittance reference.'),
  invoiceBankAccount: z.string().optional().describe('Related invoice bank account.')
});

let buildTransactionLine = (line: z.infer<typeof transactionLineInputSchema>) => {
  if (
    (line.currencyCode === undefined && line.currencyRate !== undefined) ||
    (line.currencyCode !== undefined && line.currencyRate === undefined)
  ) {
    throw finagoServiceError(
      'currencyCode and currencyRate must be provided together for transaction lines.'
    );
  }

  let body: Record<string, unknown> = {
    accountNumber: line.accountNumber,
    amount: line.amount,
    tax: objectWithDefined({
      number: line.taxNumber,
      amount: line.taxAmount,
      baseRate: line.taxBaseRate,
      specificationNumber: line.taxSpecificationNumber
    })
  };

  if (line.comment !== undefined) body.comment = line.comment;
  if (line.date !== undefined) body.date = line.date;
  if (line.periodDate !== undefined) body.periodDate = line.periodDate;
  if (line.dimensions !== undefined) body.dimensions = line.dimensions;
  if (line.currencyCode !== undefined || line.currencyRate !== undefined) {
    body.currency = objectWithDefined({ code: line.currencyCode, rate: line.currencyRate });
  }
  if (
    line.invoiceNumber !== undefined ||
    line.invoiceDueDate !== undefined ||
    line.invoiceRemittanceReference !== undefined ||
    line.invoiceBankAccount !== undefined
  ) {
    body.invoice = objectWithDefined({
      number: line.invoiceNumber,
      dueDate: line.invoiceDueDate,
      remittanceReference: line.invoiceRemittanceReference,
      bankAccount: line.invoiceBankAccount
    });
  }

  return body;
};

export let finagoListTransactionLines = SlateTool.create(spec, {
  name: 'List Transaction Lines',
  key: 'finago_list_transaction_lines',
  description:
    'Read Finago ledger transaction lines for a required date range with filters for creation/modification time, transaction, customer, account, invoice, currency, dimensions, and pagination.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      dateFrom: z.string().describe('Inclusive start date in YYYY-MM-DD format.'),
      dateTo: z.string().describe('Exclusive end date in YYYY-MM-DD format.'),
      createdFrom: z.string().optional().describe('Created timestamp lower bound.'),
      modifiedFrom: z.string().optional().describe('Modified timestamp lower bound.'),
      transactionId: z.string().optional().describe('Transaction UUID.'),
      transactionNumber: z.number().int().optional().describe('Transaction number.'),
      transactionTypeId: z.number().int().optional().describe('Transaction type ID.'),
      customerId: z.number().int().optional().describe('Customer ID.'),
      accountId: z.number().int().optional().describe('Account ID.'),
      accountNumber: z.number().int().optional().describe('Account number.'),
      invoiceNumber: z.string().optional().describe('Invoice number.'),
      currencyCode: z.string().optional().describe('Currency code.'),
      includeDimensions: z.boolean().optional().describe('Include dimension details.'),
      page: z.number().int().positive().optional().describe('Page number.'),
      limit: z.number().int().positive().optional().describe('Page size.'),
      maxPages: maxPagesSchema
    })
  )
  .output(
    z.object({
      transactionLines: z.array(z.unknown()).describe('Transaction lines returned by Finago.'),
      count: z.number(),
      pageCount: z.number().optional(),
      hasNextPage: z.boolean().optional(),
      nextLink: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);
    let result = await client.list(
      '/transactionlines',
      {
        dateFrom: ctx.input.dateFrom,
        dateTo: ctx.input.dateTo,
        createdFrom: ctx.input.createdFrom,
        modifiedFrom: ctx.input.modifiedFrom,
        transactionId: ctx.input.transactionId,
        transactionNumber: ctx.input.transactionNumber,
        transactionTypeId: ctx.input.transactionTypeId,
        customerId: ctx.input.customerId,
        accountId: ctx.input.accountId,
        accountNumber: ctx.input.accountNumber,
        invoiceNumber: ctx.input.invoiceNumber,
        currencyCode: ctx.input.currencyCode,
        includeDimensions: ctx.input.includeDimensions,
        page: ctx.input.page,
        limit: ctx.input.limit
      },
      ctx.input.maxPages ?? 1,
      'list transaction lines'
    );

    return {
      output: {
        transactionLines: result.records,
        count: result.count,
        pageCount: result.pageCount,
        hasNextPage: result.hasNextPage,
        nextLink: result.nextLink
      },
      message: `Retrieved **${result.count}** Finago transaction line(s).`
    };
  })
  .build();

export let finagoGetAccountBalances = SlateTool.create(spec, {
  name: 'Get Account Balances',
  key: 'finago_get_account_balances',
  description:
    'Read Finago account balances and monthly changes for a date range, optionally for one account.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      dateFrom: z.string().describe('Start date for balances.'),
      dateTo: z.string().describe('End date for balances.'),
      accountId: z.number().int().positive().optional().describe('Optional account ID.'),
      periods: z
        .string()
        .optional()
        .describe('Comma-separated period dates as accepted by Finago.'),
      type: z.enum(['Date', 'Period']).optional().describe('Balance aggregation type.'),
      keepIncoming: z.boolean().optional().describe('Include incoming amounts.')
    })
  )
  .output(
    z.object({
      balances: z.array(z.unknown()).describe('Account balances returned by Finago.'),
      count: z.number().describe('Number of account balance records returned.')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);
    let path =
      ctx.input.accountId !== undefined
        ? `/accountbalances/${ctx.input.accountId}`
        : '/accountbalances';
    let result = await client.list(
      path,
      {
        dateFrom: ctx.input.dateFrom,
        dateTo: ctx.input.dateTo,
        periods: ctx.input.periods,
        type: ctx.input.type,
        keepIncoming: ctx.input.keepIncoming
      },
      1,
      'get account balances'
    );

    return {
      output: {
        balances: result.records,
        count: result.count
      },
      message: `Retrieved **${result.count}** Finago account balance record(s).`
    };
  })
  .build();

export let finagoPostTransaction = SlateTool.create(spec, {
  name: 'Post Transaction',
  key: 'finago_post_transaction',
  description:
    'Post a balanced transaction to the Finago general ledger. Use reference data and account/tax lists before calling this tool.',
  constraints: [
    'All lines must balance to zero per date.',
    'confirm must be true.',
    'Use this only for user-approved posting workflows, not read-only reporting.'
  ],
  tags: { readOnly: false, destructive: true }
})
  .input(
    z.object({
      confirm: z.boolean().describe('Must be true to post the transaction.'),
      transactionTypeNumber: z
        .number()
        .int()
        .positive()
        .describe('Finago transaction type number.'),
      date: z.string().describe('Transaction date.'),
      comment: z.string().optional().describe('Transaction comment.'),
      documentId: z.number().int().positive().optional().describe('Attached document ID.'),
      lines: z
        .array(transactionLineInputSchema)
        .min(2)
        .describe('Balanced transaction lines.'),
      additionalFields: z
        .record(z.string(), z.unknown())
        .optional()
        .describe('Additional Finago transaction request fields.')
    })
  )
  .output(
    z.object({
      transactionId: z.string().optional().describe('Created transaction ID.'),
      record: z.unknown().describe('Raw Finago transaction creation response.')
    })
  )
  .handleInvocation(async ctx => {
    if (ctx.input.confirm !== true) {
      throw finagoServiceError('confirm must be true to post a transaction.');
    }

    let total = ctx.input.lines.reduce((sum, line) => sum + line.amount, 0);
    if (Math.abs(total) > 0.000001) {
      throw finagoServiceError('Transaction lines must balance to zero.');
    }

    let client = createClientFromContext(ctx);
    let body = {
      transactionTypeNumber: ctx.input.transactionTypeNumber,
      date: ctx.input.date,
      comment: ctx.input.comment,
      documentId: ctx.input.documentId,
      lines: ctx.input.lines.map(buildTransactionLine),
      ...(ctx.input.additionalFields ?? {})
    };
    let record = await client.post('/transactions', body, undefined, 'post transaction');
    let transactionId =
      typeof record === 'object' &&
      record !== null &&
      'transactionId' in record &&
      typeof record.transactionId === 'string'
        ? record.transactionId
        : undefined;

    return {
      output: { transactionId, record },
      message: `Posted Finago transaction${transactionId ? ` **${transactionId}**` : ''}.`
    };
  })
  .build();
