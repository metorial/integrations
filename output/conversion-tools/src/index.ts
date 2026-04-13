import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  convertFile,
  getTask,
  listTasks,
  listConversions,
  manageTask,
  getFileInfo,
  captureWebsite,
  getAccount,
} from './tools';
import { taskCompleted,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    convertFile,
    getTask,
    listTasks,
    listConversions,
    manageTask,
    getFileInfo,
    captureWebsite,
    getAccount,
  ],
  triggers: [
    inboundWebhook,
    taskCompleted,
  ],
});
