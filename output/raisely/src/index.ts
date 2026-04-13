import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCampaigns,
  getCampaign,
  listProfiles,
  manageProfile,
  listDonations,
  createDonation,
  listSubscriptions,
  manageSubscription,
  listUsers,
  upsertUser,
  listProducts,
  managePost,
  sendMessage,
} from './tools';
import {
  donationEvents,
  subscriptionEvents,
  profileEvents,
  userEvents,
  orderEvents,
  postEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCampaigns,
    getCampaign,
    listProfiles,
    manageProfile,
    listDonations,
    createDonation,
    listSubscriptions,
    manageSubscription,
    listUsers,
    upsertUser,
    listProducts,
    managePost,
    sendMessage,
  ],
  triggers: [
    donationEvents,
    subscriptionEvents,
    profileEvents,
    userEvents,
    orderEvents,
    postEvents,
  ],
});
