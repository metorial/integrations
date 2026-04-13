import { Slate } from 'slates';
import { spec } from './spec';
import {
  listPublications,
  listIssues,
  getIssue,
  createDraftIssue,
  deleteDraftIssue,
  listLinks,
  createLink,
  updateLink,
  deleteLink,
  listSubscribers,
  subscribeEmail,
  unsubscribeEmail,
  listUnsubscribers,
  listCategories,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listPublications,
    listIssues,
    getIssue,
    createDraftIssue,
    deleteDraftIssue,
    listLinks,
    createLink,
    updateLink,
    deleteLink,
    listSubscribers,
    subscribeEmail,
    unsubscribeEmail,
    listUnsubscribers,
    listCategories,
  ],
  triggers: [
    inboundWebhook,
  ],
});
