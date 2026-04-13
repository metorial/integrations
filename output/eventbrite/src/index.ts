import { Slate } from 'slates';
import { spec } from './spec';
import {
  getEvent,
  listEvents,
  createEvent,
  updateEvent,
  publishEvent,
  manageTicketClass,
  listOrders,
  getOrder,
  listAttendees,
  manageVenue,
  manageDiscount,
  manageOrganizer,
  getUser,
} from './tools';
import {
  eventLifecycle,
  orderActivity,
  attendeeActivity,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getEvent,
    listEvents,
    createEvent,
    updateEvent,
    publishEvent,
    manageTicketClass,
    listOrders,
    getOrder,
    listAttendees,
    manageVenue,
    manageDiscount,
    manageOrganizer,
    getUser,
  ],
  triggers: [
    eventLifecycle,
    orderActivity,
    attendeeActivity,
  ],
});
