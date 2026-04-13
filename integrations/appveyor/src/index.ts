import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjects,
  getProject,
  manageProject,
  getProjectSettings,
  getBuildHistory,
  startBuild,
  manageBuild,
  getBuildLogAndArtifacts,
  manageEnvironment,
  manageDeployment,
  manageUsers,
  manageCollaborators,
  manageRoles,
  encryptValue,
} from './tools';
import { buildEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProjects,
    getProject,
    manageProject,
    getProjectSettings,
    getBuildHistory,
    startBuild,
    manageBuild,
    getBuildLogAndArtifacts,
    manageEnvironment,
    manageDeployment,
    manageUsers,
    manageCollaborators,
    manageRoles,
    encryptValue,
  ],
  triggers: [
    buildEvents,
  ],
});
