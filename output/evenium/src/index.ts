import {
  Slate } from 'slates';
import { spec } from './spec';
import { listEvents, getEvent, createEvent, listParticipants, addParticipant, listContacts, manageContact, updateParticipantStatus } from './tools';
import { newEvent, eventParticipant,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listEvents, getEvent, createEvent, listParticipants, addParticipant, listContacts, manageContact, updateParticipantStatus],
  triggers: [
    inboundWebhook,newEvent, eventParticipant]
});
