import { Slate } from 'slates';
import { spec } from './spec';
import {
  listAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  makeCall,
  getCall,
  listCalls,
  manageKnowledgeBase,
  listVoices,
  manageContact,
  manageAction,
  listPhoneNumbers,
  exportAnalytics,
  manageSubaccount,
  runSimulation,
} from './tools';
import {
  postCallWebhook,
  inboundCallWebhook,
  callCompletedPolling,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listAgents,
    getAgent,
    createAgent,
    updateAgent,
    deleteAgent,
    makeCall,
    getCall,
    listCalls,
    manageKnowledgeBase,
    listVoices,
    manageContact,
    manageAction,
    listPhoneNumbers,
    exportAnalytics,
    manageSubaccount,
    runSimulation,
  ],
  triggers: [
    postCallWebhook,
    inboundCallWebhook,
    callCompletedPolling,
  ],
});
