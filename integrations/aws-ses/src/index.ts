import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  sendEmail,
  sendBulkEmail,
  manageEmailTemplate,
  manageContactList,
  manageContact,
  manageEmailIdentity,
  manageSuppression,
  getAccount,
  manageConfigurationSet,
  manageDedicatedIpPool,
  manageEventDestination,
  getMessageInsights,
} from './tools';
import {
  suppressionChanges,
  identityChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendEmail,
    sendBulkEmail,
    manageEmailTemplate,
    manageContactList,
    manageContact,
    manageEmailIdentity,
    manageSuppression,
    getAccount,
    manageConfigurationSet,
    manageDedicatedIpPool,
    manageEventDestination,
    getMessageInsights,
  ],
  triggers: [
    inboundWebhook,
    suppressionChanges,
    identityChanges,
  ],
});
