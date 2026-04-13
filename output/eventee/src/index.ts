import {
  Slate } from 'slates';
import { spec } from './spec';
import { getEventContent, listParticipants, listRegistrations, inviteAttendees } from './tools';
import { newParticipant, newRegistration,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [getEventContent, listParticipants, listRegistrations, inviteAttendees],
  triggers: [
    inboundWebhook,newParticipant, newRegistration],
});
