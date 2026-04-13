import { Slate } from 'slates';
import { spec } from './spec';
import {
  listConnectors,
  getConnectorOperations,
  callConnector,
  listUsers,
  createUser,
  deleteUser,
  generateUserToken,
  listSolutions,
  listSolutionInstances,
  getSolutionInstance,
  createSolutionInstance,
  updateSolutionInstance,
  deleteSolutionInstance,
  upgradeSolutionInstance,
  listAuthentications,
  createAuthentication,
  deleteAuthentication
} from './tools';
import { workflowWebhook, solutionInstanceChanges } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listConnectors,
    getConnectorOperations,
    callConnector,
    listUsers,
    createUser,
    deleteUser,
    generateUserToken,
    listSolutions,
    listSolutionInstances,
    getSolutionInstance,
    createSolutionInstance,
    updateSolutionInstance,
    deleteSolutionInstance,
    upgradeSolutionInstance,
    listAuthentications,
    createAuthentication,
    deleteAuthentication
  ],
  triggers: [workflowWebhook, solutionInstanceChanges]
});
