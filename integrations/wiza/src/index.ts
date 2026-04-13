import { Slate } from 'slates';
import { spec } from './spec';
import { enrichContact, getEnrichmentResult, enrichCompany, checkCredits } from './tools';
import { enrichmentCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [enrichContact, getEnrichmentResult, enrichCompany, checkCredits],
  triggers: [enrichmentCompleted],
});
