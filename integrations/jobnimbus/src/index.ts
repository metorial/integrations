import { Slate } from 'slates';
import { spec } from './spec';
import {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  listJobs,
  getJob,
  createJob,
  updateJob,
  listTasks,
  createTask,
  updateTask,
  createActivity,
  listActivities,
  createEstimate,
  createInvoice,
  listFinancialDocuments,
  createFile
} from './tools';
import { contactEvents, jobEvents, taskEvents, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
    listJobs,
    getJob,
    createJob,
    updateJob,
    listTasks,
    createTask,
    updateTask,
    createActivity,
    listActivities,
    createEstimate,
    createInvoice,
    listFinancialDocuments,
    createFile
  ],
  triggers: [inboundWebhook, contactEvents, jobEvents, taskEvents]
});
