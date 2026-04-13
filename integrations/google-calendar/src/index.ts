import { Slate } from 'slates';
import { spec } from './spec';
import {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  quickAddEvent,
  listCalendars,
  manageCalendar,
  findFreeBusy,
  manageSharing,
  getColors
} from './tools';
import {
  eventChanges,
  calendarListChanges
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createEvent,
    listEvents,
    getEvent,
    updateEvent,
    deleteEvent,
    quickAddEvent,
    listCalendars,
    manageCalendar,
    findFreeBusy,
    manageSharing,
    getColors
  ],
  triggers: [
    eventChanges,
    calendarListChanges
  ]
});
