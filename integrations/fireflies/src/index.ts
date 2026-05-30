import { Slate } from 'slates';
import { spec } from './spec';
import {
  addToLiveMeeting,
  askFred,
  continueAskFredThread,
  createSoundbite,
  deleteTranscript,
  getAiApps,
  getTranscript,
  getUser,
  listActiveMeetings,
  listChannels,
  listTranscripts,
  listUsers,
  revokeMeetingAccess,
  setUserRole,
  shareMeeting,
  updateTranscript,
  uploadAudio
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
    getAiApps
  ],
  triggers: [transcriptionCompleted]
});
