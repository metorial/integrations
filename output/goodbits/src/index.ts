import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getNewsletter,
  addSubscriber,
  updateSubscriberStatus,
  getSubscriberCounts,
  createContentLink,
  listSentEmails,
  getEmailAnalytics,
} from './tools';
import { newSentEmail,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getNewsletter,
    addSubscriber,
    updateSubscriberStatus,
    getSubscriberCounts,
    createContentLink,
    listSentEmails,
    getEmailAnalytics,
  ],
  triggers: [
    inboundWebhook,
    newSentEmail,
  ],
});
