import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjects,
  getProject,
  createProject,
  manageProject,
  startAutopilot,
  listModels,
  getModel,
  listDatasets,
  getDataset,
  manageDataset,
  listDeployments,
  getDeployment,
  createDeployment,
  manageDeployment,
  makePredictions,
  getDeploymentMonitoring,
  listModelPackages,
  registerModel
} from './tools';
import { deploymentEvents, projectEvents, datasetEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProjects,
    getProject,
    createProject,
    manageProject,
    startAutopilot,
    listModels,
    getModel,
    listDatasets,
    getDataset,
    manageDataset,
    listDeployments,
    getDeployment,
    createDeployment,
    manageDeployment,
    makePredictions,
    getDeploymentMonitoring,
    listModelPackages,
    registerModel
  ],
  triggers: [deploymentEvents, projectEvents, datasetEvents]
});
