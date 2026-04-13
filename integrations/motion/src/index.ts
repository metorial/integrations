import { Slate } from 'slates';
import { spec } from './spec';
import {
  createTask,
  getTask,
  listTasks,
  updateTask,
  deleteTask,
  createProject,
  getProject,
  listProjects,
  createRecurringTask,
  listRecurringTasks,
  deleteRecurringTask,
  listComments,
  createComment,
  listCustomFields,
  createCustomField,
  deleteCustomField,
  setCustomFieldValue,
  listWorkspaces,
  listStatuses,
  listSchedules,
  listUsers
} from './tools';
import { taskUpdates, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createTask,
    getTask,
    listTasks,
    updateTask,
    deleteTask,
    createProject,
    getProject,
    listProjects,
    createRecurringTask,
    listRecurringTasks,
    deleteRecurringTask,
    listComments,
    createComment,
    listCustomFields,
    createCustomField,
    deleteCustomField,
    setCustomFieldValue,
    listWorkspaces,
    listStatuses,
    listSchedules,
    listUsers
  ],
  triggers: [inboundWebhook, taskUpdates]
});
