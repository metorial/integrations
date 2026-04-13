import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProperties,
  getProperty,
  listBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  getAvailability,
  updateAvailability,
  getRates,
  updateRates,
  getQuote,
  managePaymentLink,
  sendMessage
} from './tools';
import {
  bookingChanges,
  availabilityChanges,
  rateChanges,
  guestMessageReceived
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProperties,
    getProperty,
    listBookings,
    getBooking,
    createBooking,
    updateBookingStatus,
    getAvailability,
    updateAvailability,
    getRates,
    updateRates,
    getQuote,
    managePaymentLink,
    sendMessage
  ],
  triggers: [bookingChanges, availabilityChanges, rateChanges, guestMessageReceived]
});
