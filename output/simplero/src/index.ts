import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageContact,
  tagContact,
  manageListSubscription,
  manageProduct,
  listInvoices,
  manageAdministrator,
  manageBroadcast,
  getCourseCompletions,
  startAutomation,
  listTags,
} from './tools';
import {
  subscriptionEvents,
  purchaseEvents,
  taggingEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageContact,
    tagContact,
    manageListSubscription,
    manageProduct,
    listInvoices,
    manageAdministrator,
    manageBroadcast,
    getCourseCompletions,
    startAutomation,
    listTags,
  ],
  triggers: [
    subscriptionEvents,
    purchaseEvents,
    taggingEvents,
  ],
});
