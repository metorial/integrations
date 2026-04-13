import { Slate } from 'slates';
import { spec } from './spec';
import {
  getAccount,
  listSubscribers,
  getSubscriber,
  createSubscriber,
  updateSubscriber,
  unsubscribe,
  manageTags,
  tagSubscriber,
  manageCustomFields,
  listForms,
  addSubscriberToForm,
  manageBroadcasts,
  getBroadcastStats,
  manageSequences,
  listSegments,
  managePurchases,
  listEmailTemplates
} from './tools';
import {
  subscriberEvent,
  tagEvent,
  purchaseEvent,
  formSubscribeEvent
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getAccount,
    listSubscribers,
    getSubscriber,
    createSubscriber,
    updateSubscriber,
    unsubscribe,
    manageTags,
    tagSubscriber,
    manageCustomFields,
    listForms,
    addSubscriberToForm,
    manageBroadcasts,
    getBroadcastStats,
    manageSequences,
    listSegments,
    managePurchases,
    listEmailTemplates
  ],
  triggers: [
    subscriberEvent,
    tagEvent,
    purchaseEvent,
    formSubscribeEvent
  ]
});
