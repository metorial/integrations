import { Slate } from 'slates';
import { spec } from './spec';
import { transcribeAudio, getTranscription, uploadAudio, deleteTranscription, initiateLiveSession, getLiveSessionResult } from './tools';
import { transcriptionCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    transcribeAudio,
    getTranscription,
    uploadAudio,
    deleteTranscription,
    initiateLiveSession,
    getLiveSessionResult,
  ],
  triggers: [
    transcriptionCompleted,
  ],
});
