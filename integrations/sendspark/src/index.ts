import { Slate } from 'slates';
import { spec } from './spec';
import { listCampaigns, getCampaign, createCampaign, addProspect, addProspectsBulk, getProspect, checkHealth } from './tools';
import { videoEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listCampaigns, getCampaign, createCampaign, addProspect, addProspectsBulk, getProspect, checkHealth],
  triggers: [videoEvents],
});
