import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listProjects,
  getProject,
  createProject,
  updateProjectStatus,
  runProject,
  getRunStatus,
  cancelRun,
  listProjectRuns,
  manageProjectSharing,
  createEmbeddingUrl,
  listUsers,
  deactivateUser,
  manageGroup,
  listGroups,
  deleteGroup,
  manageCollection,
  listCollections,
  listDataConnections,
  getDataConnection,
  getQueriedTables,
} from './tools';
import {
  projectRunCompleted,
  newProject,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProjects,
    getProject,
    createProject,
    updateProjectStatus,
    runProject,
    getRunStatus,
    cancelRun,
    listProjectRuns,
    manageProjectSharing,
    createEmbeddingUrl,
    listUsers,
    deactivateUser,
    manageGroup,
    listGroups,
    deleteGroup,
    manageCollection,
    listCollections,
    listDataConnections,
    getDataConnection,
    getQueriedTables,
  ],
  triggers: [
    inboundWebhook,
    projectRunCompleted,
    newProject,
  ],
});
