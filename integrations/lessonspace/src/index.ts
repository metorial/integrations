import { Slate } from 'slates';
import { spec } from './spec';
import {
  launchSpace,
  listSessions,
  getSession,
  updateSession,
  getRecording,
  getTranscript,
  listSpaces,
  listUsers,
  removeUser
} from './tools';
import { spaceEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    launchSpace,
    listSessions,
    getSession,
    updateSession,
    getRecording,
    getTranscript,
    listSpaces,
    listUsers,
    removeUser
  ],
  triggers: [spaceEvents]
});
