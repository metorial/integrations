import { Slate } from 'slates';
import { spec } from './spec';
import {
  listWorkers,
  getWorker,
  getTimeOffEntries,
  requestTimeOff,
  getTimeBlocks,
  executeWql,
  getCustomReport,
  getInboxTasks,
  actionInboxTask,
  listOrganizations,
  getOrganizationWorkers,
  listCustomObjects,
  getCustomObject,
  createCustomObject,
  updateCustomObject,
  deleteCustomObject
} from './tools';
import { workerChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listWorkers,
    getWorker,
    getTimeOffEntries,
    requestTimeOff,
    getTimeBlocks,
    executeWql,
    getCustomReport,
    getInboxTasks,
    actionInboxTask,
    listOrganizations,
    getOrganizationWorkers,
    listCustomObjects,
    getCustomObject,
    createCustomObject,
    updateCustomObject,
    deleteCustomObject
  ],
  triggers: [inboundWebhook, workerChanges]
});
