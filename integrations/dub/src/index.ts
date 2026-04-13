import { Slate } from 'slates';
import { spec } from './spec';
import {
  createLink,
  updateLink,
  getLink,
  listLinks,
  upsertLink,
  deleteLink,
  getAnalytics,
  trackLead,
  trackSale,
  manageTags,
  manageDomains,
  listCustomers,
  getMetatags,
  listEvents
} from './tools';
import { linkEvents, linkClicked, conversionEvents, partnerEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createLink,
    updateLink,
    getLink,
    listLinks,
    upsertLink,
    deleteLink,
    getAnalytics,
    trackLead,
    trackSale,
    manageTags,
    manageDomains,
    listCustomers,
    getMetatags,
    listEvents
  ],
  triggers: [linkEvents, linkClicked, conversionEvents, partnerEvents]
});
