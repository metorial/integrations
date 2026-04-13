import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  createTask,
  updateTask,
  getTask,
  listTasks,
  deleteTask,
  createComment,
  listComments,
  createDoc,
  updateDoc,
  listDocs,
  deleteDoc,
  getWorkspaceConfig
} from './tools';
import {
  taskEvents,
  docEvents,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createTask,
    updateTask,
    getTask,
    listTasks,
    deleteTask,
    createComment,
    listComments,
    createDoc,
    updateDoc,
    listDocs,
    deleteDoc,
    getWorkspaceConfig
  ],
  triggers: [
    inboundWebhook,
    taskEvents,
    docEvents
  ]
});
