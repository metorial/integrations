import { Slate } from 'slates';
import { spec } from './spec';
import { enrichContacts, getEnrichmentResults, checkCredits, manageWebhook } from './tools';
import { enrichmentResult } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [enrichContacts, getEnrichmentResults, checkCredits, manageWebhook],
  triggers: [enrichmentResult],
});
