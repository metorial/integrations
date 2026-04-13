import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjects,
  createQuery,
  listQueries,
  getRecommendations,
  getContent,
  importContent,
  evaluateContent
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listProjects,
    createQuery,
    listQueries,
    getRecommendations,
    getContent,
    importContent,
    evaluateContent
  ],
  triggers: [inboundWebhook]
});
