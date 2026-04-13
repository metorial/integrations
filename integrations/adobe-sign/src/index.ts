import { Slate } from 'slates';
import { spec } from './spec';
import {
  uploadDocument,
  createAgreement,
  getAgreement,
  listAgreements,
  updateAgreementState,
  getSigningUrls,
  sendReminder,
  downloadAuditTrail,
  getFormData,
  createWebForm,
  listWebForms,
  createLibraryTemplate,
  listLibraryTemplates,
  sendInBulk,
  listUsers
} from './tools';
import { agreementEvents, webFormEvents, megaSignEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    uploadDocument,
    createAgreement,
    getAgreement,
    listAgreements,
    updateAgreementState,
    getSigningUrls,
    sendReminder,
    downloadAuditTrail,
    getFormData,
    createWebForm,
    listWebForms,
    createLibraryTemplate,
    listLibraryTemplates,
    sendInBulk,
    listUsers
  ] as any,
  triggers: [agreementEvents, webFormEvents, megaSignEvents] as any
});
