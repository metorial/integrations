import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCampaigns,
  getCampaign,
  toggleCampaignStatus,
  addLeadsToCampaign,
  getLead,
  getLeadsFromList,
  addLeadsToList,
  listLists,
  createList,
  getConversations,
  sendMessage,
  getLinkedInAccounts,
  getStats
} from './tools';
import { outreachEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCampaigns,
    getCampaign,
    toggleCampaignStatus,
    addLeadsToCampaign,
    getLead,
    getLeadsFromList,
    addLeadsToList,
    listLists,
    createList,
    getConversations,
    sendMessage,
    getLinkedInAccounts,
    getStats
  ],
  triggers: [outreachEvents]
});
