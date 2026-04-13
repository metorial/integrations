import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  executeSql,
  checkStatementStatus,
  cancelStatement,
  manageDatabase,
  manageSchema,
  manageTable,
  manageWarehouse,
  manageUser,
  manageRole,
  manageTask,
  manageGrant,
} from './tools';
import {
  queryCompleted,
  taskRunCompleted,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    executeSql,
    checkStatementStatus,
    cancelStatement,
    manageDatabase,
    manageSchema,
    manageTable,
    manageWarehouse,
    manageUser,
    manageRole,
    manageTask,
    manageGrant,
  ],
  triggers: [
    inboundWebhook,
    queryCompleted,
    taskRunCompleted,
  ],
});
