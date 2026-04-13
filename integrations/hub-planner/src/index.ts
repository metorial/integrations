import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageProject,
  getProject,
  searchProjects,
  manageResource,
  getResource,
  searchResources,
  manageBooking,
  getBooking,
  searchBookings,
  manageTimeEntry,
  searchTimeEntries,
  manageEvent,
  manageMilestone,
  manageVacation,
  manageClient,
  manageHoliday,
  listBookingCategories
} from './tools';
import { projectEvents, bookingEvents, resourceEvents, timeEntryEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageProject,
    getProject,
    searchProjects,
    manageResource,
    getResource,
    searchResources,
    manageBooking,
    getBooking,
    searchBookings,
    manageTimeEntry,
    searchTimeEntries,
    manageEvent,
    manageMilestone,
    manageVacation,
    manageClient,
    manageHoliday,
    listBookingCategories
  ],
  triggers: [projectEvents, bookingEvents, resourceEvents, timeEntryEvents]
});
