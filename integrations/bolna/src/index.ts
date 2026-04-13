import { Slate } from 'slates';
import { spec } from './spec';
import {
  createAgent,
  getAgent,
  listAgents,
  updateAgent,
  deleteAgent,
  makeCall,
  stopCall,
  manageBatch,
  getBatch,
  getExecution,
  listExecutions,
  manageKnowledgeBase,
  listPhoneNumbers,
  setupInbound,
  listVoices,
  getAccountInfo
} from './tools';
import { callStatus } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createAgent,
    getAgent,
    listAgents,
    updateAgent,
    deleteAgent,
    makeCall,
    stopCall,
    manageBatch,
    getBatch,
    getExecution,
    listExecutions,
    manageKnowledgeBase,
    listPhoneNumbers,
    setupInbound,
    listVoices,
    getAccountInfo
  ],
  triggers: [callStatus]
});
