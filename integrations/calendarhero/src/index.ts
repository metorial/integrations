import { Slate } from 'slates';
import { spec } from './spec';
import {
  getProfile,
  listMeetingTypes,
  listMeetings,
  createMeetingRequest,
  manageMeetingRequest,
  createContact,
  searchContacts,
  getContact,
  updateContact,
  deleteContact
} from './tools';
import {
  meetingEvents,
  contactEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getProfile,
    listMeetingTypes,
    listMeetings,
    createMeetingRequest,
    manageMeetingRequest,
    createContact,
    searchContacts,
    getContact,
    updateContact,
    deleteContact
  ],
  triggers: [
    meetingEvents,
    contactEvents
  ]
});
