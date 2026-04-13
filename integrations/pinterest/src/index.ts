import { Slate } from 'slates';
import { spec } from './spec';
import {
  createPin,
  getPin,
  listPins,
  updatePin,
  deletePin,
  manageBoard,
  listBoards,
  manageBoardSection,
  getUserAccount,
  getAnalytics,
  listAdAccounts,
  listCampaigns,
  sendConversions,
  listCatalogs,
  getTrends,
  searchPins,
  manageAudience
} from './tools';
import { newPin, newBoard, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createPin,
    getPin,
    listPins,
    updatePin,
    deletePin,
    manageBoard,
    listBoards,
    manageBoardSection,
    getUserAccount,
    getAnalytics,
    listAdAccounts,
    listCampaigns,
    sendConversions,
    listCatalogs,
    getTrends,
    searchPins,
    manageAudience
  ],
  triggers: [inboundWebhook, newPin, newBoard]
});
