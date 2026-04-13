import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  createSpaceTool,
  getSpaceTool,
  updateSpaceTool,
  endActiveConferenceTool,
  addMemberTool,
  listMembersTool,
  removeMemberTool,
  listConferenceRecordsTool,
  getConferenceRecordTool,
  listParticipantsTool,
  getParticipantSessionsTool,
  listRecordingsTool,
  getRecordingTool,
  listTranscriptsTool,
  getTranscriptTool,
  listTranscriptEntriesTool
} from './tools';
import {
  conferenceEventsTrigger,
  participantEventsTrigger,
  recordingEventsTrigger,
  transcriptEventsTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createSpaceTool,
    getSpaceTool,
    updateSpaceTool,
    endActiveConferenceTool,
    addMemberTool,
    listMembersTool,
    removeMemberTool,
    listConferenceRecordsTool,
    getConferenceRecordTool,
    listParticipantsTool,
    getParticipantSessionsTool,
    listRecordingsTool,
    getRecordingTool,
    listTranscriptsTool,
    getTranscriptTool,
    listTranscriptEntriesTool
  ],
  triggers: [
    inboundWebhook,
    conferenceEventsTrigger,
    participantEventsTrigger,
    recordingEventsTrigger,
    transcriptEventsTrigger
  ]
});
