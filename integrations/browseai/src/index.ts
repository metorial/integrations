import { Slate } from 'slates';
import { spec } from './spec';
import {
  listRobots,
  getRobot,
  runTask,
  getTask,
  listTasks,
  createBulkRun,
  getBulkRun,
  updateCookies,
  listWebhooks,
  createWebhook,
  deleteWebhook,
} from './tools';
import {
  taskCompleted,
  dataChanged,
  tableExportCompleted,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listRobots,
    getRobot,
    runTask,
    getTask,
    listTasks,
    createBulkRun,
    getBulkRun,
    updateCookies,
    listWebhooks,
    createWebhook,
    deleteWebhook,
  ],
  triggers: [
    taskCompleted,
    dataChanged,
    tableExportCompleted,
  ],
});
