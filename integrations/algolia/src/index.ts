import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  search,
  manageRecords,
  manageIndices,
  indexSettings,
  manageSynonyms,
  manageRules,
  searchAnalytics,
  sendEvents,
  manageApiKeys,
  manageAbTests,
  getRecommendations,
  monitoring,
} from './tools';
import { indexUpdated,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    search,
    manageRecords,
    manageIndices,
    indexSettings,
    manageSynonyms,
    manageRules,
    searchAnalytics,
    sendEvents,
    manageApiKeys,
    manageAbTests,
    getRecommendations,
    monitoring,
  ],
  triggers: [
    inboundWebhook,
    indexUpdated,
  ],
});
