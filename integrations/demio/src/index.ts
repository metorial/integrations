import { Slate } from 'slates';
import { spec } from './spec';
import { listEvents, getEvent, registerParticipant, getParticipants } from './tools';
import { webinarEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listEvents, getEvent, registerParticipant, getParticipants],
  triggers: [webinarEvents]
});
