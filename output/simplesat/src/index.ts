import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listSurveys,
  listQuestions,
  getAnswers,
  getResponses,
  upsertCustomer,
  sendSurveyEmail,
  getTeamMember,
  listTeamMembers,
} from './tools';
import { newFeedback,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listSurveys,
    listQuestions,
    getAnswers,
    getResponses,
    upsertCustomer,
    sendSurveyEmail,
    getTeamMember,
    listTeamMembers,
  ],
  triggers: [
    inboundWebhook,
    newFeedback,
  ],
});
