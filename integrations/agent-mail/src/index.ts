import { Slate } from 'slates';
import { spec } from './spec';
import {
  createInbox,
  listInboxes,
  getInbox,
  updateInbox,
  deleteInbox,
  sendEmail,
  replyToEmail,
  forwardEmail,
  listMessages,
  getMessage,
  updateMessageLabels,
  listThreads,
  getThread,
  deleteThread,
  manageDraft,
  listDrafts,
  deleteDraft,
  getAttachment,
  manageDomain,
  listDomains,
  managePod,
  listPods,
  manageListEntry,
  listListEntries,
  manageWebhook
} from './tools';
import { messageEvents, domainEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createInbox,
    listInboxes,
    getInbox,
    updateInbox,
    deleteInbox,
    sendEmail,
    replyToEmail,
    forwardEmail,
    listMessages,
    getMessage,
    updateMessageLabels,
    listThreads,
    getThread,
    deleteThread,
    manageDraft,
    listDrafts,
    deleteDraft,
    getAttachment,
    manageDomain,
    listDomains,
    managePod,
    listPods,
    manageListEntry,
    listListEntries,
    manageWebhook
  ],
  triggers: [messageEvents, domainEvents]
});
