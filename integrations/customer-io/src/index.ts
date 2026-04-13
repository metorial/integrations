import { Slate } from 'slates';
import { spec } from './spec';
import {
  upsertPerson,
  deletePerson,
  suppressPerson,
  getPerson,
  searchPeople,
  mergePeople,
  trackEvent,
  manageDevice,
  listSegments,
  getSegmentMembership,
  manageManualSegment,
  listCampaigns,
  getCampaign,
  triggerBroadcast,
  sendTransactionalMessage,
  manageCollection,
  listCollections,
} from './tools';
import {
  messageEvent,
  subscriptionEvent,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    upsertPerson,
    deletePerson,
    suppressPerson,
    getPerson,
    searchPeople,
    mergePeople,
    trackEvent,
    manageDevice,
    listSegments,
    getSegmentMembership,
    manageManualSegment,
    listCampaigns,
    getCampaign,
    triggerBroadcast,
    sendTransactionalMessage,
    manageCollection,
    listCollections,
  ],
  triggers: [
    messageEvent,
    subscriptionEvent,
  ],
});
