import { Slate } from 'slates';
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
  getAccountSettings,
  manageRuntimeManagement,
  manageRecursionConfig
} from './tools/index';
import { functionChanges, inboundWebhook } from './triggers/index';

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
    getAccountSettings,
    manageRuntimeManagement,
    manageRecursionConfig
  ],
  triggers: [inboundWebhook, functionChanges]
});
