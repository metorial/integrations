import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  listComments,
  createComment,
  updateComment,
  deleteComment,
  listTags,
  manageTag,
  assignTag,
  listTeamMembers,
  manageProjectSection
} from './tools';
import {
  newTaskTrigger,
  updatedTaskTrigger,
  newProjectTrigger,
  newCommentTrigger,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProjects,
    createProject,
    updateProject,
    deleteProject,
    listTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    listComments,
    createComment,
    updateComment,
    deleteComment,
    listTags,
    manageTag,
    assignTag,
    listTeamMembers,
    manageProjectSection
  ],
  triggers: [
    inboundWebhook,
    newTaskTrigger,
    updatedTaskTrigger,
    newProjectTrigger,
    newCommentTrigger
  ]
});
