import { Slate } from 'slates';
import { spec } from './spec';
import { listBookings, getBooking, listBookingCalendars, listBookingPages, listEventTypes, listUsers, listTeams } from './tools';
import { bookingEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listBookings, getBooking, listBookingCalendars, listBookingPages, listEventTypes, listUsers, listTeams],
  triggers: [bookingEvents],
});
