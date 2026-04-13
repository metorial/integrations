import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageTimeEntry,
  listTimeEntries,
  startStopTimer,
  manageProject,
  listProjects,
  manageClient,
  listClients,
  manageInvoice,
  listInvoices,
  sendInvoice,
  recordInvoicePayment,
  manageExpense,
  listExpenses,
  manageTask,
  listTasks,
  manageUser,
  listUsers,
  manageEstimate,
  manageContact,
  generateReport,
  getCompany
} from './tools';
import { timeEntryChanges, invoiceChanges, projectChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageTimeEntry,
    listTimeEntries,
    startStopTimer,
    manageProject,
    listProjects,
    manageClient,
    listClients,
    manageInvoice,
    listInvoices,
    sendInvoice,
    recordInvoicePayment,
    manageExpense,
    listExpenses,
    manageTask,
    listTasks,
    manageUser,
    listUsers,
    manageEstimate,
    manageContact,
    generateReport,
    getCompany
  ],
  triggers: [inboundWebhook, timeEntryChanges, invoiceChanges, projectChanges]
});
