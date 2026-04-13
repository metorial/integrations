import { Slate } from 'slates';
import { spec } from './spec';
import {
  listSurveys,
  getSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  createCollector,
  updateCollector,
  listCollectors,
  deleteCollector,
  getResponses,
  getResponse,
  listContactLists,
  createContactList,
  listContacts,
  createContact,
  createContactsBulk,
  deleteContactList,
  sendInvitation,
  getUser
} from './tools';
import { responseEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listSurveys,
    getSurvey,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    createCollector,
    updateCollector,
    listCollectors,
    deleteCollector,
    getResponses,
    getResponse,
    listContactLists,
    createContactList,
    listContacts,
    createContact,
    createContactsBulk,
    deleteContactList,
    sendInvitation,
    getUser
  ],
  triggers: [responseEvent]
});
