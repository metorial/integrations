import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjects,
  getProject,
  createProject,
  deleteProject,
  listServers,
  createServer,
  deleteServer,
  listServerGroups,
  createDeployment,
  getDeployment,
  listDeployments,
  listScheduledDeployments,
  listConfigFiles,
  createConfigFile,
  updateConfigFile,
  deleteConfigFile,
  listSshCommands,
  createSshCommand,
  deleteSshCommand
} from './tools';
import { deploymentEvents, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProjects,
    getProject,
    createProject,
    deleteProject,
    listServers,
    createServer,
    deleteServer,
    listServerGroups,
    createDeployment,
    getDeployment,
    listDeployments,
    listScheduledDeployments,
    listConfigFiles,
    createConfigFile,
    updateConfigFile,
    deleteConfigFile,
    listSshCommands,
    createSshCommand,
    deleteSshCommand
  ],
  triggers: [inboundWebhook, deploymentEvents]
});
