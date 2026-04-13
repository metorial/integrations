import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendPostcard,
  sendNotecard,
  sendLetter,
  sendGiftcard,
  manageRecipients,
  manageMailingLists,
  manageOrders,
  listTemplates,
  listHandwritingStyles,
  listGiftcardBrands,
  manageSubAccounts,
  radiusSearch,
} from './tools';
import {
  orderStatusEvents,
  mailDeliveryEvents,
  mailStatusEvents,
  qrScanEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendPostcard,
    sendNotecard,
    sendLetter,
    sendGiftcard,
    manageRecipients,
    manageMailingLists,
    manageOrders,
    listTemplates,
    listHandwritingStyles,
    listGiftcardBrands,
    manageSubAccounts,
    radiusSearch,
  ],
  triggers: [
    orderStatusEvents,
    mailDeliveryEvents,
    mailStatusEvents,
    qrScanEvents,
  ],
});
