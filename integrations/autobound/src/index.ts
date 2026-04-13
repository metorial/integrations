import { Slate } from 'slates';
import { spec } from './spec';
import { generateContent, generateInsights, importCampaignContact, enrichCompany } from './tools';
import { signalEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    generateContent,
    generateInsights,
    importCampaignContact,
    enrichCompany,
  ],
  triggers: [
    signalEvent,
  ],
});
