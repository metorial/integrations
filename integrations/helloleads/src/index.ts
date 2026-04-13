import { Slate } from 'slates';
import { spec } from './spec';
import { getLeads, createLead, getLists } from './tools';
import { newLeadAdded, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [getLeads, createLead, getLists],
  triggers: [inboundWebhook, newLeadAdded]
});
