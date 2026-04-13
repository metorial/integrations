import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  getTimeEntries,
  getTimeEntry,
  manageUserAssignments,
  manageTaskAssignments,
  listUsers,
  getUser,
  updateUser,
  getProjectReport,
  getSummaryReport
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    listTasks,
    createTask,
    updateTask,
    deleteTask,
    getTimeEntries,
    getTimeEntry,
    manageUserAssignments,
    manageTaskAssignments,
    listUsers,
    getUser,
    updateUser,
    getProjectReport,
    getSummaryReport
  ],
  triggers: [inboundWebhook]
});
