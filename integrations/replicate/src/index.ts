import { Slate } from 'slates';
import { spec } from './spec';
import {
  runPrediction,
  getPrediction,
  listPredictions,
  cancelPrediction,
  getModel,
  createModel,
  updateModel,
  deleteModel,
  searchModels,
  listModelVersions,
  createTraining,
  getTraining,
  listTrainings,
  cancelTraining,
  createDeployment,
  getDeployment,
  listDeployments,
  updateDeployment,
  deleteDeployment,
  listCollections,
  getCollection,
  listFiles,
  getFile,
  deleteFile,
  listHardware,
  getAccount
} from './tools';
import { predictionCompleted, trainingCompleted, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    runPrediction,
    getPrediction,
    listPredictions,
    cancelPrediction,
    getModel,
    createModel,
    updateModel,
    deleteModel,
    searchModels,
    listModelVersions,
    createTraining,
    getTraining,
    listTrainings,
    cancelTraining,
    createDeployment,
    getDeployment,
    listDeployments,
    updateDeployment,
    deleteDeployment,
    listCollections,
    getCollection,
    listFiles,
    getFile,
    deleteFile,
    listHardware,
    getAccount
  ],
  triggers: [inboundWebhook, predictionCompleted, trainingCompleted]
});
