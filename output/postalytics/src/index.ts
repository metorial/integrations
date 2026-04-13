import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendMail,
  manageContacts,
  manageCampaigns,
  manageTemplates,
  manageFlows,
  getCampaignEvents,
  manageWebhooks,
  manageAccount,
  manageSuppressionLists,
  createLoginLink,
} from './tools';
import { mailEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendMail,
    manageContacts,
    manageCampaigns,
    manageTemplates,
    manageFlows,
    getCampaignEvents,
    manageWebhooks,
    manageAccount,
    manageSuppressionLists,
    createLoginLink,
  ],
  triggers: [
    mailEvent,
  ],
});
