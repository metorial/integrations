import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  getTask,
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  batchTasks,
  getUser,
} from './tools';
import { taskChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    getTask,
    listProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    batchTasks,
    getUser,
  ],
  triggers: [
    inboundWebhook,
    taskChanges,
  ],
});
