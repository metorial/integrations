import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getUserProfile,
  getFundBalance,
  getCauses,
  listContributions,
  createDonation,
  cancelDonation,
  listDonations,
  createGift,
  listGifts,
  getGift,
  searchNonprofits,
  getNonprofit,
} from './tools';
import {
  newDonations,
  newContributions,
  newGifts,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getUserProfile,
    getFundBalance,
    getCauses,
    listContributions,
    createDonation,
    cancelDonation,
    listDonations,
    createGift,
    listGifts,
    getGift,
    searchNonprofits,
    getNonprofit,
  ],
  triggers: [
    inboundWebhook,
    newDonations,
    newContributions,
    newGifts,
  ],
});
