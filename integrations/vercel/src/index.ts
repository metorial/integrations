import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjectsTool,
  getProjectTool,
  createProjectTool,
  updateProjectTool,
  deleteProjectTool,
  listDeploymentsTool,
  getDeploymentTool,
  getDeploymentEventsTool,
  createDeploymentTool,
  cancelDeploymentTool,
  manageAliasesTool,
  manageDomainsTool,
  manageEnvVarsTool,
  manageDnsTool,
  manageTeamsTool,
  manageEdgeConfigTool,
  manageDeployHooksTool,
  promoteDeploymentTool
} from './tools';
import {
  deploymentEventsTrigger,
  projectEventsTrigger,
  domainEventsTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProjectsTool,
    getProjectTool,
    createProjectTool,
    updateProjectTool,
    deleteProjectTool,
    listDeploymentsTool,
    getDeploymentTool,
    getDeploymentEventsTool,
    createDeploymentTool,
    cancelDeploymentTool,
    manageAliasesTool,
    manageDomainsTool,
    manageEnvVarsTool,
    manageDnsTool,
    manageTeamsTool,
    manageEdgeConfigTool,
    manageDeployHooksTool,
    promoteDeploymentTool
  ],
  triggers: [deploymentEventsTrigger, projectEventsTrigger, domainEventsTrigger]
});
