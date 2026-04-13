import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjectsTool,
  getProjectTool,
  createProjectTool,
  updateProjectTool,
  deleteProjectTool,
  getServiceTool,
  createServiceTool,
  updateServiceTool,
  deleteServiceTool,
  listDeploymentsTool,
  getDeploymentTool,
  triggerDeploymentTool,
  rollbackDeploymentTool,
  cancelDeploymentTool,
  getDeploymentLogsTool,
  listEnvironmentsTool,
  getEnvironmentTool,
  createEnvironmentTool,
  deleteEnvironmentTool,
  getVariablesTool,
  setVariablesTool,
  deleteVariableTool,
  getDomainsTool,
  createDomainTool,
  deleteDomainTool,
  listVolumesTool,
  createVolumeTool,
  updateVolumeTool,
  deleteVolumeTool
} from './tools';
import { projectWebhookTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProjectsTool,
    getProjectTool,
    createProjectTool,
    updateProjectTool,
    deleteProjectTool,
    getServiceTool,
    createServiceTool,
    updateServiceTool,
    deleteServiceTool,
    listDeploymentsTool,
    getDeploymentTool,
    triggerDeploymentTool,
    rollbackDeploymentTool,
    cancelDeploymentTool,
    getDeploymentLogsTool,
    listEnvironmentsTool,
    getEnvironmentTool,
    createEnvironmentTool,
    deleteEnvironmentTool,
    getVariablesTool,
    setVariablesTool,
    deleteVariableTool,
    getDomainsTool,
    createDomainTool,
    deleteDomainTool,
    listVolumesTool,
    createVolumeTool,
    updateVolumeTool,
    deleteVolumeTool
  ],
  triggers: [
    projectWebhookTrigger
  ]
});
