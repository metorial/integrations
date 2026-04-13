import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTaskLists,
  createTaskList,
  updateTaskList,
  deleteTaskList,
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  clearCompletedTasks
} from './tools';
import { taskChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTaskLists,
    createTaskList,
    updateTaskList,
    deleteTaskList,
    listTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    clearCompletedTasks
  ],
  triggers: [inboundWebhook, taskChanges]
});
