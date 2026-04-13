import { Slate } from 'slates';
import { spec } from './spec';
import {
  createContact,
  createOpportunity,
  createTask,
  findTask,
  logTime,
  listUsers,
  getNotifications,
  createContactRecord
} from './tools';
import { newTaskCreated, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createContact,
    createOpportunity,
    createTask,
    findTask,
    logTime,
    listUsers,
    getNotifications,
    createContactRecord
  ],
  triggers: [inboundWebhook, newTaskCreated]
});
