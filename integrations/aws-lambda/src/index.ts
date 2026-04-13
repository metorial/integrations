import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listFunctions,
  getFunction,
  createFunction,
  updateFunction,
  deleteFunction,
  invokeFunction,
  publishVersion,
  manageAlias,
  manageLayer,
  manageEventSourceMapping,
  manageFunctionUrl,
  manageConcurrency,
  managePermission,
  manageTags,
  configureAsyncInvocation,
  manageDurableExecution,
  getAccountSettings
} from './tools/index';
import { functionChanges,
  inboundWebhook,
} from './triggers/index';

export let provider = Slate.create({
  spec,
  tools: [
    listFunctions,
    getFunction,
    createFunction,
    updateFunction,
    deleteFunction,
    invokeFunction,
    publishVersion,
    manageAlias,
    manageLayer,
    manageEventSourceMapping,
    manageFunctionUrl,
    manageConcurrency,
    managePermission,
    manageTags,
    configureAsyncInvocation,
    manageDurableExecution,
    getAccountSettings
  ],
  triggers: [
    inboundWebhook,
    functionChanges
  ]
});
