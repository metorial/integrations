import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getContact,
  searchContacts,
  uploadContacts,
  updateContact,
  deleteContact,
  bulkUpdateContacts,
  sendSms,
  sendBulkEmail,
  listEmailTemplates,
  listCampaigns,
  getDeliveries,
  searchSendLogs,
  searchReplies,
  uploadSales,
  manageTags,
  checkCompliance,
  manageExchangeTransactions,
  getCreditBalance
} from './tools';
import { newReply,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getContact,
    searchContacts,
    uploadContacts,
    updateContact,
    deleteContact,
    bulkUpdateContacts,
    sendSms,
    sendBulkEmail,
    listEmailTemplates,
    listCampaigns,
    getDeliveries,
    searchSendLogs,
    searchReplies,
    uploadSales,
    manageTags,
    checkCompliance,
    manageExchangeTransactions,
    getCreditBalance
  ],
  triggers: [
    inboundWebhook,
    newReply
  ]
});
