import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageClients,
  listClients,
  getClient,
  manageInvoices,
  listInvoices,
  getInvoice,
  managePayments,
  listPayments,
  manageEstimates,
  manageExpenses,
  listExpenses,
  manageTimeEntries,
  listTimeEntries,
  manageProjects,
  listProjects,
  manageTaxes,
  listTaxes,
  manageItems,
  listItems,
  manageCreditNotes
} from './tools';
import {
  invoiceEvents,
  clientEvents,
  estimateEvents,
  expenseEvents,
  paymentEvents,
  projectEvents,
  timeEntryEvents,
  billEvents,
  creditNoteEvents,
  itemEvents,
  taxEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageClients,
    listClients,
    getClient,
    manageInvoices,
    listInvoices,
    getInvoice,
    managePayments,
    listPayments,
    manageEstimates,
    manageExpenses,
    listExpenses,
    manageTimeEntries,
    listTimeEntries,
    manageProjects,
    listProjects,
    manageTaxes,
    listTaxes,
    manageItems,
    listItems,
    manageCreditNotes
  ],
  triggers: [
    invoiceEvents,
    clientEvents,
    estimateEvents,
    expenseEvents,
    paymentEvents,
    projectEvents,
    timeEntryEvents,
    billEvents,
    creditNoteEvents,
    itemEvents,
    taxEvents
  ]
});
