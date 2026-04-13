import { Slate } from 'slates';
import { spec } from './spec';
import {
  listUsers,
  listCustomers,
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  listTasks,
  getTask,
  createTask,
  updateTask,
  postComment
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listUsers,
    listCustomers,
    listProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    listTasks,
    getTask,
    createTask,
    updateTask,
    postComment
  ],
  triggers: [inboundWebhook]
});
