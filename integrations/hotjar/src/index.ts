import { Slate } from 'slates';
import { spec } from './spec';
import { listSurveys, getSurveyResponses, userLookup } from './tools';
import { surveyResponseTrigger, recordingTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listSurveys, getSurveyResponses, userLookup],
  triggers: [surveyResponseTrigger, recordingTrigger]
});
