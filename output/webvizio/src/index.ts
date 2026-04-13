import { Slate } from 'slates';
import { spec } from './spec';
import {
  createProject,
  findProject,
  updateProject,
  deleteProject,
  createTask,
  findTask,
  updateTask,
  deleteTask,
  createComment,
  findComment,
  deleteComment,
} from './tools';
import {
  projectEvents,
  taskEvents,
  commentEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createProject,
    findProject,
    updateProject,
    deleteProject,
    createTask,
    findTask,
    updateTask,
    deleteTask,
    createComment,
    findComment,
    deleteComment,
  ],
  triggers: [
    projectEvents,
    taskEvents,
    commentEvents,
  ],
});
