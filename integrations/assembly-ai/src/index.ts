import { Slate } from 'slates';
import { spec } from './spec';
import {
  submitTranscription,
  getTranscript,
  listTranscripts,
  deleteTranscript,
  getTranscriptText,
  getSubtitles,
  searchTranscript,
  getRedactedAudio,
  lemurTask,
  createStreamingToken
} from './tools';
import { transcriptionCompleted, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    submitTranscription,
    getTranscript,
    listTranscripts,
    deleteTranscript,
    getTranscriptText,
    getSubtitles,
    searchTranscript,
    getRedactedAudio,
    lemurTask,
    createStreamingToken
  ],
  triggers: [inboundWebhook, transcriptionCompleted]
});
