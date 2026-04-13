import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendMessage,
  countTokens,
  listModels,
  manageMessageBatch,
  manageOrganizationMembers,
  manageWorkspaces,
  manageApiKeys,
  getOrganization
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    sendMessage,
    countTokens,
    listModels,
    manageMessageBatch,
    manageOrganizationMembers,
    manageWorkspaces,
    manageApiKeys,
    getOrganization
  ],
  triggers: [inboundWebhook]
});
