import { SlateTool } from 'slates';
import { PayPalClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageInvoice = SlateTool.create(
  spec,
  {
    name: 'Manage Invoice',
    key: 'manage_invoice',
    description: `Manage existing PayPal invoices. Send, cancel, or record payment against a draft or sent invoice. Can also retrieve invoice details.`,
    instructions: [
      'Use action **send** to send a draft invoice to the recipient.',
      'Use action **cancel** to cancel a sent invoice.',
      'Use action **recordPayment** to record an external payment against an invoice.',
      'Use action **get** to retrieve full invoice details.',
    ],
    tags: {
      destructive: false,
      readOnly: false,
    },
  }
)
  .input(z.object({
    action: z.enum(['send', 'cancel', 'recordPayment', 'get']).describe('Action to perform on the invoice'),
    invoiceId: z.string().describe('PayPal invoice ID'),
    subject: z.string().optional().describe('Email subject for send/cancel actions'),
    note: z.string().optional().describe('Note to include with the action'),
    paymentMethod: z.enum(['BANK_TRANSFER', 'CASH', 'CHECK', 'CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'WIRE_TRANSFER', 'OTHER']).optional().describe('Payment method for recordPayment action'),
    paymentDate: z.string().optional().describe('Payment date in YYYY-MM-DD format for recordPayment'),
    paymentAmount: z.string().optional().describe('Payment amount as a string for recordPayment'),
    paymentCurrencyCode: z.string().optional().describe('Currency code for recordPayment'),
  }))
  .output(z.object({
    invoiceId: z.string().describe('PayPal invoice ID'),
    status: z.string().optional().describe('Invoice status'),
    invoiceNumber: z.string().optional().describe('Invoice number'),
    recipientEmail: z.string().optional().describe('Recipient email'),
    totalAmount: z.string().optional().describe('Total invoice amount'),
    currencyCode: z.string().optional().describe('Currency code'),
    invoice: z.any().optional().describe('Full invoice details (for get action)'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new PayPalClient({
      token: ctx.auth.token,
      clientId: ctx.auth.clientId,
      clientSecret: ctx.auth.clientSecret,
      environment: ctx.auth.environment,
    });

    switch (ctx.input.action) {
      case 'send': {
        await client.sendInvoice(ctx.input.invoiceId, {
          subject: ctx.input.subject,
          note: ctx.input.note,
          sendToRecipient: true,
        });
        let invoice = await client.getInvoice(ctx.input.invoiceId);
        return {
          output: {
            invoiceId: ctx.input.invoiceId,
            status: invoice.status,
            invoiceNumber: invoice.detail?.invoice_number,
            recipientEmail: invoice.primary_recipients?.[0]?.billing_info?.email_address,
            totalAmount: invoice.amount?.value,
            currencyCode: invoice.amount?.currency_code,
          },
          message: `Invoice \`${ctx.input.invoiceId}\` sent. Status: **${invoice.status}**.`,
        };
      }
      case 'cancel': {
        await client.cancelInvoice(ctx.input.invoiceId, {
          subject: ctx.input.subject,
          note: ctx.input.note,
          sendToRecipient: true,
        });
        return {
          output: {
            invoiceId: ctx.input.invoiceId,
            status: 'CANCELLED',
          },
          message: `Invoice \`${ctx.input.invoiceId}\` cancelled.`,
        };
      }
      case 'recordPayment': {
        if (!ctx.input.paymentMethod) {
          throw new Error('paymentMethod is required for recordPayment action');
        }
        let paymentParams: Record<string, any> = {
          method: ctx.input.paymentMethod,
        };
        if (ctx.input.paymentDate) paymentParams.date = ctx.input.paymentDate;
        if (ctx.input.paymentAmount && ctx.input.paymentCurrencyCode) {
          paymentParams.amount = { currency_code: ctx.input.paymentCurrencyCode, value: ctx.input.paymentAmount };
        }
        if (ctx.input.note) paymentParams.note = ctx.input.note;

        await client.recordInvoicePayment(ctx.input.invoiceId, paymentParams as any);
        let invoice = await client.getInvoice(ctx.input.invoiceId);
        return {
          output: {
            invoiceId: ctx.input.invoiceId,
            status: invoice.status,
            invoiceNumber: invoice.detail?.invoice_number,
            totalAmount: invoice.amount?.value,
            currencyCode: invoice.amount?.currency_code,
          },
          message: `Payment recorded for invoice \`${ctx.input.invoiceId}\`. Status: **${invoice.status}**.`,
        };
      }
      case 'get': {
        let invoice = await client.getInvoice(ctx.input.invoiceId);
        return {
          output: {
            invoiceId: ctx.input.invoiceId,
            status: invoice.status,
            invoiceNumber: invoice.detail?.invoice_number,
            recipientEmail: invoice.primary_recipients?.[0]?.billing_info?.email_address,
            totalAmount: invoice.amount?.value,
            currencyCode: invoice.amount?.currency_code,
            invoice,
          },
          message: `Invoice \`${ctx.input.invoiceId}\` (#${invoice.detail?.invoice_number}) is **${invoice.status}**. Amount: ${invoice.amount?.currency_code} ${invoice.amount?.value}.`,
        };
      }
    }
  })
  .build();
