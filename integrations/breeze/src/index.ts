import { Slate } from 'slates';
import { spec } from './spec';
import {
  listPeople,
  getPerson,
  createPerson,
  updatePerson,
  deletePerson,
  listProfileFields,
  manageFamily,
  listTags,
  manageTag,
  assignTag,
  listEvents,
  getEvent,
  createEvent,
  deleteEvent,
  manageAttendance,
  listAttendance,
  addContribution,
  listForms,
  listFormEntries,
  removeFormEntry,
  manageVolunteers,
  manageVolunteerRoles,
  getAccount,
  queryAccountLog
} from './tools';
import { accountChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listPeople,
    getPerson,
    createPerson,
    updatePerson,
    deletePerson,
    listProfileFields,
    manageFamily,
    listTags,
    manageTag,
    assignTag,
    listEvents,
    getEvent,
    createEvent,
    deleteEvent,
    manageAttendance,
    listAttendance,
    addContribution,
    listForms,
    listFormEntries,
    removeFormEntry,
    manageVolunteers,
    manageVolunteerRoles,
    getAccount,
    queryAccountLog
  ],
  triggers: [inboundWebhook, accountChanges]
});
