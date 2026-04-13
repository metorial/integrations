import {
  Slate } from 'slates';
import { spec } from './spec';
import { extractPage, searchKnowledgeGraph, enhanceEntity, analyzeText, manageCrawl, manageBulkJob } from './tools';
import { crawlBulkJobCompleted,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [extractPage, searchKnowledgeGraph, enhanceEntity, analyzeText, manageCrawl, manageBulkJob],
  triggers: [
    inboundWebhook,crawlBulkJobCompleted],
});
