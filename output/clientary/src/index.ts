import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  createClient, updateClient, getClient, deleteClient,
  createContact, updateContact, listContacts, deleteContact,
  createLead, updateLead, getLeads, deleteLead,
  createInvoice, updateInvoice, getInvoices, deleteInvoice, sendInvoice,
  createEstimate, updateEstimate, getEstimates, deleteEstimate, sendEstimate,
  createProject, updateProject, getProjects, deleteProject,
  logTime, updateTimeEntry, getTimeEntries, deleteTimeEntry,
  createTask, updateTask, getTasks, deleteTask,
  createExpense, updateExpense, getExpenses, deleteExpense,
  createPayment, listPayments, deletePayment,
  createRecurringSchedule, updateRecurringSchedule, getRecurringSchedules, deleteRecurringSchedule,
  listStaff
} from './tools';
import {
  newClientTrigger,
  newInvoiceTrigger,
  newPaymentTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createClient, updateClient, getClient, deleteClient,
    createContact, updateContact, listContacts, deleteContact,
    createLead, updateLead, getLeads, deleteLead,
    createInvoice, updateInvoice, getInvoices, deleteInvoice, sendInvoice,
    createEstimate, updateEstimate, getEstimates, deleteEstimate, sendEstimate,
    createProject, updateProject, getProjects, deleteProject,
    logTime, updateTimeEntry, getTimeEntries, deleteTimeEntry,
    createTask, updateTask, getTasks, deleteTask,
    createExpense, updateExpense, getExpenses, deleteExpense,
    createPayment, listPayments, deletePayment,
    createRecurringSchedule, updateRecurringSchedule, getRecurringSchedules, deleteRecurringSchedule,
    listStaff
  ],
  triggers: [
    inboundWebhook,
    newClientTrigger,
    newInvoiceTrigger,
    newPaymentTrigger
  ]
});
