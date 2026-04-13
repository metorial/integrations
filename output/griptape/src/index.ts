import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  manageAssistant,
  listAssistants,
  getAssistant,
  runAssistant,
  runStructure,
  listStructures,
  queryKnowledgeBase,
  listKnowledgeBases,
  manageKnowledgeBaseJob,
  manageThread,
  manageMessage,
  manageRuleset,
  queryRetriever,
  listRetrievers,
  runToolActivity,
  listGriptapeTools,
  listDataConnectors,
  manageBucket,
} from './tools';
import {
  assistantRunCompleted,
  structureRunCompleted,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageAssistant,
    listAssistants,
    getAssistant,
    runAssistant,
    runStructure,
    listStructures,
    queryKnowledgeBase,
    listKnowledgeBases,
    manageKnowledgeBaseJob,
    manageThread,
    manageMessage,
    manageRuleset,
    queryRetriever,
    listRetrievers,
    runToolActivity,
    listGriptapeTools,
    listDataConnectors,
    manageBucket,
  ],
  triggers: [
    inboundWebhook,
    assistantRunCompleted,
    structureRunCompleted,
  ],
});
