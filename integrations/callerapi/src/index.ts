import { Slate } from 'slates';
import { spec } from './spec';
import {
  lookupPhoneNumber,
  getCallerId,
  getCallerPicture,
  checkPortedStatus,
  getPortingHistory,
  assessPortFraudRisk,
  checkOnlinePresence,
  getAccountInfo
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    lookupPhoneNumber,
    getCallerId,
    getCallerPicture,
    checkPortedStatus,
    getPortingHistory,
    assessPortFraudRisk,
    checkOnlinePresence,
    getAccountInfo
  ],
  triggers: [inboundWebhook]
});
