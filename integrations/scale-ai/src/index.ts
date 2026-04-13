import { Slate } from 'slates';
import { spec } from './spec';
import {
  createProject,
  getProject,
  listProjects,
  updateProject,
  createTask,
  getTask,
  listTasks,
  cancelTask,
  updateTask,
  createBatch,
  getBatch,
  listBatches,
  finalizeBatch,
  manageTeam,
  importFile,
  createEvaluationTask,
  resendCallback,
} from './tools';
import {
  taskCompleted,
  batchCompleted,
  taskStatusChanged,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createProject,
    getProject,
    listProjects,
    updateProject,
    createTask,
    getTask,
    listTasks,
    cancelTask,
    updateTask,
    createBatch,
    getBatch,
    listBatches,
    finalizeBatch,
    manageTeam,
    importFile,
    createEvaluationTask,
    resendCallback,
  ],
  triggers: [
    taskCompleted,
    batchCompleted,
    taskStatusChanged,
  ],
});
