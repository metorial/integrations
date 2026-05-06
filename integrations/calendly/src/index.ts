import { Slate } from 'slates';
import { spec } from './spec';
import {
  listEvents,
  getEvent,
  getEventInvitee,
  cancelEvent,
  listEventTypes,
  getEventType,
  checkAvailability,
  createSchedulingLink,
  createEventInvitee,
  listInvitees,
  markNoShow,
  getUser,
  listOrganizationMembers,
  listRoutingForms
} from './tools';
import { inviteeEvents, routingFormSubmission } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listEvents,
    getEvent,
    getEventInvitee,
    cancelEvent,
    listEventTypes,
    getEventType,
    checkAvailability,
    createSchedulingLink,
    createEventInvitee,
    listInvitees,
    markNoShow,
    getUser,
    listOrganizationMembers,
    listRoutingForms
  ],
  triggers: [inviteeEvents, routingFormSubmission]
});
