import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  uploadDocument,
  configureForm,
  sendNotification,
  getDocumentMetadata,
  checkDocument,
  removeDocument,
  getFormDescriptor,
  getLinkedDocuments,
  listContacts,
  upsertContacts,
  removeContact,
  createBriefcase,
  getBriefcase,
  removeBriefcase,
  createSignExpress,
  getSignExpress,
  removeSignExpress,
  createEditorExpress,
  getEditorExpress,
  removeEditorExpress,
  getAccountInfo,
  listActiveDocuments,
  calculateSignerId,
  updateTokenConfig,
  getAuditTrail
} from './tools';
import {
  documentSigned,
  notificationError,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    uploadDocument,
    configureForm,
    sendNotification,
    getDocumentMetadata,
    checkDocument,
    removeDocument,
    getFormDescriptor,
    getLinkedDocuments,
    listContacts,
    upsertContacts,
    removeContact,
    createBriefcase,
    getBriefcase,
    removeBriefcase,
    createSignExpress,
    getSignExpress,
    removeSignExpress,
    createEditorExpress,
    getEditorExpress,
    removeEditorExpress,
    getAccountInfo,
    listActiveDocuments,
    calculateSignerId,
    updateTokenConfig,
    getAuditTrail
  ],
  triggers: [
    inboundWebhook,
    documentSigned,
    notificationError
  ]
});
