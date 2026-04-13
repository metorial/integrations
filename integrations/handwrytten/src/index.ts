import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  sendCard,
  browseCards,
  getCardDetails,
  listCardCategories,
  listHandwritingStyles,
  manageAddressBook,
  manageTemplates,
  manageBasket,
  listOrders,
  listGiftCards,
  listInserts,
  listReturnAddresses,
} from './tools';
import { orderStatusChanged,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendCard,
    browseCards,
    getCardDetails,
    listCardCategories,
    listHandwritingStyles,
    manageAddressBook,
    manageTemplates,
    manageBasket,
    listOrders,
    listGiftCards,
    listInserts,
    listReturnAddresses,
  ],
  triggers: [
    inboundWebhook,
    orderStatusChanged,
  ],
});
