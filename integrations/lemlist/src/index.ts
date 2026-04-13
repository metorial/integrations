import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  getCampaignStats,
  addLeadToCampaign,
  getLead,
  listCampaignLeads,
  updateLead,
  deleteLead,
  getActivities,
  manageUnsubscribes,
  searchPeopleDatabase,
  getTeamInfo
} from './tools';
import { activityEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    getCampaignStats,
    addLeadToCampaign,
    getLead,
    listCampaignLeads,
    updateLead,
    deleteLead,
    getActivities,
    manageUnsubscribes,
    searchPeopleDatabase,
    getTeamInfo
  ],
  triggers: [activityEvent]
});
