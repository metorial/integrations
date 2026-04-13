import { Slate } from 'slates';
import { spec } from './spec';
import {
  listUsers,
  listTeams,
  listCalls,
  getCall,
  createCall,
  getPresignedUrl,
  listMeetingEvents,
  getMeetingEvent,
  createMeetingEvent,
  deleteMeetingEvent,
  launchMeetingAssistant,
} from './tools';
import { callProcessed } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listUsers,
    listTeams,
    listCalls,
    getCall,
    createCall,
    getPresignedUrl,
    listMeetingEvents,
    getMeetingEvent,
    createMeetingEvent,
    deleteMeetingEvent,
    launchMeetingAssistant,
  ],
  triggers: [
    callProcessed,
  ],
});
