import { Slate } from 'slates';
import { spec } from './spec';
import {
  listMeetings,
  getMeeting,
  getTranscript,
  getHighlights,
  downloadRecording,
  importMeeting
} from './tools';
import { meetingReady, transcriptReady } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listMeetings,
    getMeeting,
    getTranscript,
    getHighlights,
    downloadRecording,
    importMeeting
  ],
  triggers: [meetingReady, transcriptReady]
});
