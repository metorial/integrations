import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listScenarios,
  manageScenario,
  createScenario,
  listConnections,
  manageConnection,
  listDataStores,
  manageDataStore,
  manageDataStoreRecords,
  listHooks,
  manageHook,
  listOrganizations,
  listTeams,
  listUsers,
  getScenarioLogs,
  getUsage,
} from './tools';
import {
  scenarioExecution,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listScenarios,
    manageScenario,
    createScenario,
    listConnections,
    manageConnection,
    listDataStores,
    manageDataStore,
    manageDataStoreRecords,
    listHooks,
    manageHook,
    listOrganizations,
    listTeams,
    listUsers,
    getScenarioLogs,
    getUsage,
  ],
  triggers: [
    inboundWebhook,
    scenarioExecution,
  ],
});
