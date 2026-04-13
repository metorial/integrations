import { Slate } from 'slates';
import { spec } from './spec';
import {
  listBookings,
  getBooking,
  createBooking,
  manageBooking,
  listEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
  manageSchedule,
  getAvailableSlots,
  getProfile,
  listCalendars,
  getBusyTimes,
} from './tools';
import {
  bookingEvents,
  meetingEvents,
  noShowEvents,
  formEvents,
  oooEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listBookings,
    getBooking,
    createBooking,
    manageBooking,
    listEventTypes,
    createEventType,
    updateEventType,
    deleteEventType,
    manageSchedule,
    getAvailableSlots,
    getProfile,
    listCalendars,
    getBusyTimes,
  ],
  triggers: [
    bookingEvents,
    meetingEvents,
    noShowEvents,
    formEvents,
    oooEvents,
  ],
});
