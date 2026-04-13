import { SlateTool } from 'slates';
import { spec } from '../spec';
import { createClientFromContext } from '../lib/helpers';
import { z } from 'zod';

let lineItemSchema = z.object({
  description: z.string().optional().describe('Description of the line item'),
  amount: z.number().describe('Total amount for this line item'),
  quantity: z.number().optional().describe('Quantity of items'),
  unitPrice: z.number().optional().describe('Price per unit'),
  itemId: z.string().optional().describe('QuickBooks Item ID to reference'),
  serviceDate: z.string().optional().describe('Date the service was performed (YYYY-MM-DD)')
});

export let createInvoice = SlateTool.create(spec, {
  name: 'Create Invoice',
  key: 'create_invoice',
  description: `Creates a new invoice in QuickBooks for a specified customer. Supports multiple line items with quantities, unit prices, and item references. Can optionally send the invoice via email immediately after creation.`,
  instructions: [
    'The customerId must reference an existing customer in QuickBooks.',
    'Either provide amount directly on each line item, or provide quantity and unitPrice and the amount will be calculated.',
    'Set sendEmail to true and provide emailAddress to email the invoice to the customer upon creation.'
  ],
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      customerId: z.string().describe('QuickBooks Customer ID'),
      lineItems: z.array(lineItemSchema).min(1).describe('Line items for the invoice'),
      dueDate: z.string().optional().describe('Due date for the invoice (YYYY-MM-DD)'),
      txnDate: z
        .string()
        .optional()
        .describe('Transaction date (YYYY-MM-DD), defaults to today'),
      customerMemo: z
        .string()
        .optional()
        .describe('Memo displayed to the customer on the invoice'),
      privateNote: z.string().optional().describe('Private note not visible to the customer'),
      sendEmail: z
        .boolean()
        .optional()
        .describe('If true, sends the invoice via email after creation'),
      emailAddress: z
        .string()
        .optional()
        .describe('Email address to send the invoice to (overrides customer default)')
    })
  )
  .output(
    z.object({
      invoiceId: z.string().describe('ID of the created invoice'),
      invoiceNumber: z.string().optional().describe('Invoice document number'),
      totalAmount: z.number().describe('Total amount of the invoice'),
      balance: z.number().describe('Outstanding balance on the invoice'),
      status: z.string().optional().describe('Email status of the invoice'),
      syncToken: z.string().describe('Sync token for subsequent updates')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);

    let lines = ctx.input.lineItems.map(item => {
      let line: any = {
        DetailType: 'SalesItemLineDetail',
        Amount: item.amount,
        Description: item.description,
        SalesItemLineDetail: {
          Qty: item.quantity,
          UnitPrice: item.unitPrice,
          ServiceDate: item.serviceDate
        }
      };

      if (item.itemId) {
        line.SalesItemLineDetail.ItemRef = { value: item.itemId };
      }

      return line;
    });

    let invoiceData: any = {
      CustomerRef: { value: ctx.input.customerId },
      Line: lines
    };

    if (ctx.input.dueDate) invoiceData.DueDate = ctx.input.dueDate;
    if (ctx.input.txnDate) invoiceData.TxnDate = ctx.input.txnDate;
    if (ctx.input.customerMemo) invoiceData.CustomerMemo = { value: ctx.input.customerMemo };
    if (ctx.input.privateNote) invoiceData.PrivateNote = ctx.input.privateNote;
    if (ctx.input.emailAddress) {
      invoiceData.BillEmail = { Address: ctx.input.emailAddress };
    }

    let invoice = await client.createInvoice(invoiceData);

    if (ctx.input.sendEmail && invoice.Id) {
      await client.sendInvoice(invoice.Id, ctx.input.emailAddress);
    }

    return {
      output: {
        invoiceId: invoice.Id,
        invoiceNumber: invoice.DocNumber,
        totalAmount: invoice.TotalAmt,
        balance: invoice.Balance,
        status: invoice.EmailStatus,
        syncToken: invoice.SyncToken
      },
      message: `Created invoice **#${invoice.DocNumber || invoice.Id}** for **$${invoice.TotalAmt}**${ctx.input.sendEmail ? ' and sent via email' : ''}.`
    };
  })
  .build();
