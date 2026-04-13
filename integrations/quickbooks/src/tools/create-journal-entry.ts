import { SlateTool } from 'slates';
import { spec } from '../spec';
import { createClientFromContext } from '../lib/helpers';
import { z } from 'zod';

let journalLineSchema = z.object({
  postingType: z.enum(['Debit', 'Credit']).describe('Whether this is a debit or credit line'),
  amount: z.number().describe('Amount for this line'),
  accountId: z.string().describe('Account ID for this line'),
  description: z.string().optional().describe('Description for this line'),
  entityId: z.string().optional().describe('Customer/Vendor ID to associate with this line'),
  entityType: z.enum(['Customer', 'Vendor']).optional().describe('Type of entity referenced')
});

export let createJournalEntry = SlateTool.create(spec, {
  name: 'Create Journal Entry',
  key: 'create_journal_entry',
  description: `Creates a manual journal entry with debit and credit lines. Used for adjustments, corrections, and non-standard transactions that don't fit standard transaction types. Total debits must equal total credits.`,
  instructions: [
    'Ensure that the sum of all debit amounts equals the sum of all credit amounts.',
    'Each line must reference a valid account ID from the chart of accounts.'
  ],
  constraints: ['Total debits must equal total credits for the journal entry to be valid.'],
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      lines: z
        .array(journalLineSchema)
        .min(2)
        .describe('Journal entry lines (must include at least one debit and one credit)'),
      txnDate: z
        .string()
        .optional()
        .describe('Transaction date (YYYY-MM-DD), defaults to today'),
      privateNote: z.string().optional().describe('Internal memo for the journal entry'),
      docNumber: z.string().optional().describe('Document number')
    })
  )
  .output(
    z.object({
      journalEntryId: z.string().describe('Journal entry ID'),
      txnDate: z.string().optional().describe('Transaction date'),
      totalAmount: z.number().optional().describe('Total amount (sum of debits)'),
      syncToken: z.string().describe('Sync token for updates')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);

    let lines = ctx.input.lines.map(line => {
      let journalLine: any = {
        DetailType: 'JournalEntryLineDetail',
        Amount: line.amount,
        Description: line.description,
        JournalEntryLineDetail: {
          PostingType: line.postingType,
          AccountRef: { value: line.accountId }
        }
      };

      if (line.entityId && line.entityType) {
        journalLine.JournalEntryLineDetail.Entity = {
          Type: line.entityType,
          EntityRef: { value: line.entityId }
        };
      }

      return journalLine;
    });

    let journalEntryData: any = {
      Line: lines
    };

    if (ctx.input.txnDate) journalEntryData.TxnDate = ctx.input.txnDate;
    if (ctx.input.privateNote) journalEntryData.PrivateNote = ctx.input.privateNote;
    if (ctx.input.docNumber) journalEntryData.DocNumber = ctx.input.docNumber;

    let journalEntry = await client.createJournalEntry(journalEntryData);
    let totalDebits = ctx.input.lines
      .filter(l => l.postingType === 'Debit')
      .reduce((sum, l) => sum + l.amount, 0);

    return {
      output: {
        journalEntryId: journalEntry.Id,
        txnDate: journalEntry.TxnDate,
        totalAmount: journalEntry.TotalAmt ?? totalDebits,
        syncToken: journalEntry.SyncToken
      },
      message: `Created journal entry (ID: ${journalEntry.Id}) with ${ctx.input.lines.length} lines totaling **$${totalDebits}**.`
    };
  })
  .build();
