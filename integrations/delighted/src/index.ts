import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendSurvey,
  listSurveyResponses,
  addSurveyResponse,
  getMetrics,
  listPeople,
  deletePerson,
  unsubscribePerson,
  cancelPendingSurveys,
  getAutopilotConfig,
  addToAutopilot,
  listAutopilotMembers,
  removeFromAutopilot
} from './tools';
import { surveyResponseTrigger, unsubscribeTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendSurvey,
    listSurveyResponses,
    addSurveyResponse,
    getMetrics,
    listPeople,
    deletePerson,
    unsubscribePerson,
    cancelPendingSurveys,
    getAutopilotConfig,
    addToAutopilot,
    listAutopilotMembers,
    removeFromAutopilot
  ],
  triggers: [surveyResponseTrigger, unsubscribeTrigger]
});
