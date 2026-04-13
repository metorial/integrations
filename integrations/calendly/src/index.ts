import { Slate } from 'slates';
import { spec } from './spec';
import {
  listEvents,
  getEvent,
  cancelEvent,
  listEventTypes,
  checkAvailability,
  createSchedulingLink,
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
    cancelEvent,
    listEventTypes,
    checkAvailability,
    createSchedulingLink,
    listInvitees,
    markNoShow,
    getUser,
    listOrganizationMembers,
    listRoutingForms
  ],
  triggers: [inviteeEvents, routingFormSubmission]
});
