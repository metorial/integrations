import { Slate } from 'slates';
import { spec } from './spec';
import {
  createOrUpdateUser,
  getUser,
  listUsers,
  deleteUser,
  mergeUsers,
  trackEvent,
  manageList,
  listLists,
  manageSubscription,
  sendEmail,
  sendSms,
  manageAccount
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    createOrUpdateUser,
    getUser,
    listUsers,
    deleteUser,
    mergeUsers,
    trackEvent,
    manageList,
    listLists,
    manageSubscription,
    sendEmail,
    sendSms,
    manageAccount
  ],
  triggers: [inboundWebhook]
});
