import { Slate } from 'slates';
import { spec } from './spec';
import {
  createProxyEmail,
  listProxyEmails,
  updateProxyEmail,
  browseReceivedEmails,
  getReceivedEmail,
  createWebhookReceiver,
  pollWebhookReceiver,
} from './tools';
import { incomingEmail } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createProxyEmail,
    listProxyEmails,
    updateProxyEmail,
    browseReceivedEmails,
    getReceivedEmail,
    createWebhookReceiver,
    pollWebhookReceiver,
  ],
  triggers: [
    incomingEmail,
  ],
});
