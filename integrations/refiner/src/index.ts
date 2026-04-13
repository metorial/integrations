import { Slate } from 'slates';
import { spec } from './spec';
import {
  listContacts,
  getContact,
  deleteContact,
  identifyUser,
  trackEvent,
  listResponses,
  storeResponse,
  tagResponse,
  listSurveys,
  manageSurvey,
  listSegments,
  manageSegment,
  getReporting,
  getAccount
} from './tools';
import { surveyInteraction, segmentEntry, tagAdded } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listContacts,
    getContact,
    deleteContact,
    identifyUser,
    trackEvent,
    listResponses,
    storeResponse,
    tagResponse,
    listSurveys,
    manageSurvey,
    listSegments,
    manageSegment,
    getReporting,
    getAccount
  ],
  triggers: [surveyInteraction, segmentEntry, tagAdded]
});
