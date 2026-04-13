import { Slate } from 'slates';
import { spec } from './spec';
import {
  getSiteDetails,
  getWaiver,
  searchWaivers,
  getWaiverForms,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  manageEventCategories,
  getWaiversForEvent,
  listWaiversByDate,
} from './tools';
import {
  waiverTrigger,
  eventTrigger,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getSiteDetails,
    getWaiver,
    searchWaivers,
    getWaiverForms,
    listEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    manageEventCategories,
    getWaiversForEvent,
    listWaiversByDate,
  ],
  triggers: [
    waiverTrigger,
    eventTrigger,
  ],
});
