import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listAccounts,
  manageContainer,
  manageWorkspace,
  manageTag,
  manageTrigger,
  manageVariable,
  manageVersion,
  manageEnvironment,
  manageFolder,
  manageUserPermission
} from './tools';
import {
  versionPublished,
  workspaceChanged,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listAccounts,
    manageContainer,
    manageWorkspace,
    manageTag,
    manageTrigger,
    manageVariable,
    manageVersion,
    manageEnvironment,
    manageFolder,
    manageUserPermission
  ],
  triggers: [
    inboundWebhook,
    versionPublished,
    workspaceChanged
  ]
});
