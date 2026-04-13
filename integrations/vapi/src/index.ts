import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageAssistant,
  listAssistants,
  manageCall,
  listCalls,
  getCallTranscript,
  managePhoneNumber,
  listPhoneNumbers,
  manageSquad,
  manageWorkflow,
  manageTool,
  manageCampaign,
  listFiles
} from './tools';
import {
  callEvent,
  assistantRequest,
  toolCallRequest
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageAssistant,
    listAssistants,
    manageCall,
    listCalls,
    getCallTranscript,
    managePhoneNumber,
    listPhoneNumbers,
    manageSquad,
    manageWorkflow,
    manageTool,
    manageCampaign,
    listFiles
  ],
  triggers: [
    callEvent,
    assistantRequest,
    toolCallRequest
  ]
});
