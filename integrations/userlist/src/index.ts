import { Slate } from 'slates';
import { spec } from './spec';
import {
  createOrUpdateUser,
  deleteUser,
  createOrUpdateCompany,
  deleteCompany,
  manageRelationship,
  trackEvent,
  sendMessage
} from './tools';
import {
  userEvents,
  companyEvents,
  relationshipEvents,
  messageEvents,
  formEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createOrUpdateUser,
    deleteUser,
    createOrUpdateCompany,
    deleteCompany,
    manageRelationship,
    trackEvent,
    sendMessage
  ],
  triggers: [userEvents, companyEvents, relationshipEvents, messageEvents, formEvents]
});
