import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  manageTimer,
  listUsers,
  listClients,
  manageClient,
  getAttendance,
  listTags,
  manageTag,
  listInvoices,
  createInvoice,
} from './tools';
import {
  newTimeEntry,
  newTask,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTimeEntries,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    listTasks,
    createTask,
    updateTask,
    deleteTask,
    manageTimer,
    listUsers,
    listClients,
    manageClient,
    getAttendance,
    listTags,
    manageTag,
    listInvoices,
    createInvoice,
  ],
  triggers: [
    inboundWebhook,
    newTimeEntry,
    newTask,
  ],
});
