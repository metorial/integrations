import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listFunctionApps,
  getFunctionApp,
  manageFunctionApp,
  listFunctions,
  getFunction,
  invokeFunction,
  manageKeys,
  manageAppSettings,
  manageSlots,
  listDeployments,
} from './tools';
import { functionAppChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listFunctionApps,
    getFunctionApp,
    manageFunctionApp,
    listFunctions,
    getFunction,
    invokeFunction,
    manageKeys,
    manageAppSettings,
    manageSlots,
    listDeployments,
  ],
  triggers: [
    inboundWebhook,
    functionAppChanges,
  ],
});
