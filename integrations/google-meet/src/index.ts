import { Slate } from 'slates';
import { spec } from './spec';
import {
  createSpaceTool,
  getSpaceTool,
  updateSpaceTool,
  endActiveConferenceTool,
  addMemberTool,
  getMemberTool,
  listMembersTool,
  removeMemberTool,
  listConferenceRecordsTool,
  getConferenceRecordTool,
  getParticipantTool,
  listParticipantsTool,
  getParticipantSessionTool,
  getParticipantSessionsTool,
  listRecordingsTool,
  getRecordingTool,
  listSmartNotesTool,
  getSmartNoteTool,
  listTranscriptsTool,
  getTranscriptTool,
  getTranscriptEntryTool,
  listTranscriptEntriesTool
} from './tools';
import {
  conferenceEventsTrigger,
  participantEventsTrigger,
  recordingEventsTrigger,
  transcriptEventsTrigger,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createSpaceTool,
    getSpaceTool,
    updateSpaceTool,
    endActiveConferenceTool,
    addMemberTool,
    getMemberTool,
    listMembersTool,
    removeMemberTool,
    listConferenceRecordsTool,
    getConferenceRecordTool,
    getParticipantTool,
    listParticipantsTool,
    getParticipantSessionTool,
    getParticipantSessionsTool,
    listRecordingsTool,
    getRecordingTool,
    listSmartNotesTool,
    getSmartNoteTool,
    listTranscriptsTool,
    getTranscriptTool,
    getTranscriptEntryTool,
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
