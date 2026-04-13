import { Slate } from 'slates';
import { spec } from './spec';
import { enrichContacts, getEnrichmentResults, checkCredits } from './tools';
import { enrichmentCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [enrichContacts, getEnrichmentResults, checkCredits],
  triggers: [enrichmentCompleted]
});
