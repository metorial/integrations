import { Slate } from 'slates';
import { spec } from './spec';
import {
  listAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  listJobs,
  getJob,
  createJob,
  updateJob,
  cancelJob,
  rescheduleJob,
  checkBookingAvailability,
  addPro,
  listToDoLists,
  listGuestReservations,
  getGuestReservation,
  createGuestReservation,
  deleteGuestReservation,
  listIssues,
  getIssue,
  createIssue,
  resolveIssue,
  deleteIssue
} from './tools';
import { bookingUpdates } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listAddresses,
    getAddress,
    createAddress,
    updateAddress,
    deleteAddress,
    listJobs,
    getJob,
    createJob,
    updateJob,
    cancelJob,
    rescheduleJob,
    checkBookingAvailability,
    addPro,
    listToDoLists,
    listGuestReservations,
    getGuestReservation,
    createGuestReservation,
    deleteGuestReservation,
    listIssues,
    getIssue,
    createIssue,
    resolveIssue,
    deleteIssue
  ],
  triggers: [bookingUpdates]
});
