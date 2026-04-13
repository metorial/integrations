import { Slate } from 'slates';
import { spec } from './spec';
import {
  listLeads,
  getLead,
  createLead,
  updateLead,
  listCampaigns,
  createCampaign,
  deleteCampaign,
  manageCampaignLead,
  listUsers,
  addDncDomain,
  listLeadStatuses,
  listLeadFields
} from './tools';
import { prospectChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listLeads,
    getLead,
    createLead,
    updateLead,
    listCampaigns,
    createCampaign,
    deleteCampaign,
    manageCampaignLead,
    listUsers,
    addDncDomain,
    listLeadStatuses,
    listLeadFields
  ],
  triggers: [inboundWebhook, prospectChanges]
});
