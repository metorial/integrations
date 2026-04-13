import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTranscripts,
  getTranscript,
  updateTranscript,
  deleteTranscript,
  uploadAudio,
  getUser,
  listUsers,
  setUserRole,
  addToLiveMeeting,
  listActiveMeetings,
  createSoundbite,
  listChannels,
  askFred,
  continueAskFredThread,
  shareMeeting,
  revokeMeetingAccess,
  getAiApps,
} from './tools';
import { transcriptionCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTranscripts,
    getTranscript,
    updateTranscript,
    deleteTranscript,
    uploadAudio,
    getUser,
    listUsers,
    setUserRole,
    addToLiveMeeting,
    listActiveMeetings,
    createSoundbite,
    listChannels,
    askFred,
    continueAskFredThread,
    shareMeeting,
    revokeMeetingAccess,
    getAiApps,
  ],
  triggers: [
    transcriptionCompleted,
  ],
});
