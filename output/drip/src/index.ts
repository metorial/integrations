import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageSubscriber,
  getSubscriber,
  listSubscribers,
  deleteSubscriber,
  unsubscribe,
  manageTags,
  manageCampaign,
  manageWorkflow,
  recordEvent,
  listEventActions,
  manageOrder,
  manageCart,
  manageProduct,
  listBroadcasts,
  listConversions,
  listCustomFields,
  listForms,
  listAccounts,
} from './tools';
import {
  subscriberActivity,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageSubscriber,
    getSubscriber,
    listSubscribers,
    deleteSubscriber,
    unsubscribe,
    manageTags,
    manageCampaign,
    manageWorkflow,
    recordEvent,
    listEventActions,
    manageOrder,
    manageCart,
    manageProduct,
    listBroadcasts,
    listConversions,
    listCustomFields,
    listForms,
    listAccounts,
  ],
  triggers: [
    subscriberActivity,
  ],
});
