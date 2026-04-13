import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  sendSms,
  scheduleSms,
  sendOtp,
  validateOtp,
  manageContacts,
  manageGroups,
  manageTemplates,
  checkBalance,
  listSenderIds,
  getSmsReport,
  getDeliveryStatus,
  manageShortUrls,
} from './tools';
import { smsReport,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendSms,
    scheduleSms,
    sendOtp,
    validateOtp,
    manageContacts,
    manageGroups,
    manageTemplates,
    checkBalance,
    listSenderIds,
    getSmsReport,
    getDeliveryStatus,
    manageShortUrls,
  ],
  triggers: [
    inboundWebhook,
    smsReport,
  ],
});
