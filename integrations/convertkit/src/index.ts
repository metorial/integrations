import { Slate } from 'slates';
import { spec } from './spec';
import {
  getAccount,
  listSubscribers,
  manageSubscriber,
  manageTags,
  manageForms,
  manageSequences,
  manageBroadcasts,
  manageCustomFields,
  createPurchase,
  listSegments,
  listEmailTemplates
} from './tools';
import {
  subscriberEvent,
  tagEvent,
  formSubscriptionEvent,
  sequenceEvent,
  purchaseEvent,
  linkClickEvent,
  productPurchaseEvent
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getAccount.build(),
    listSubscribers.build(),
    manageSubscriber.build(),
    manageTags.build(),
    manageForms.build(),
    manageSequences.build(),
    manageBroadcasts.build(),
    manageCustomFields.build(),
    createPurchase.build(),
    listSegments.build(),
    listEmailTemplates.build()
  ],
  triggers: [
    subscriberEvent.build(),
    tagEvent.build(),
    formSubscriptionEvent.build(),
    sequenceEvent.build(),
    purchaseEvent.build(),
    linkClickEvent.build(),
    productPurchaseEvent.build()
  ]
});
