import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendEmail,
  addOrUpdateContacts,
  searchContacts,
  getContact,
  deleteContacts,
  getLists,
  createList,
  updateList,
  deleteList,
  manageListContacts,
  getStats,
  getTemplates,
  getTemplate,
  createTemplate,
  deleteTemplate,
  getSuppressions,
  addSuppression,
  removeSuppression,
  getSuppressionGroups,
  validateEmail,
  getAuthenticatedDomains,
  authenticateDomain,
  validateDomain
} from './tools';
import { emailEvents, inboundEmail } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendEmail,
    addOrUpdateContacts,
    searchContacts,
    getContact,
    deleteContacts,
    getLists,
    createList,
    updateList,
    deleteList,
    manageListContacts,
    getStats,
    getTemplates,
    getTemplate,
    createTemplate,
    deleteTemplate,
    getSuppressions,
    addSuppression,
    removeSuppression,
    getSuppressionGroups,
    validateEmail,
    getAuthenticatedDomains,
    authenticateDomain,
    validateDomain
  ],
  triggers: [emailEvents, inboundEmail]
});
