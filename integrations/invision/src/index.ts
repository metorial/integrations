import { Slate } from 'slates';
import { spec } from './spec';
import {
  getDesignTokens,
  getDesignTokenStyles,
  listScimUsers,
  getScimUser,
  provisionScimUser,
  updateScimUser,
  deprovisionScimUser
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    getDesignTokens,
    getDesignTokenStyles,
    listScimUsers,
    getScimUser,
    provisionScimUser,
    updateScimUser,
    deprovisionScimUser
  ],
  triggers: [inboundWebhook]
});
