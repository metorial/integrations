import { Slate } from 'slates';
import { spec } from './spec';
import {
  createMeeting,
  getMeeting,
  listMeetings,
  updateMeeting,
  deleteMeeting,
  listUsers,
  getUser,
  createWebinar,
  listWebinars,
  listRecordings,
  getMeetingRecordings,
  sendChatMessage,
  listChatChannels,
  getMeetingParticipants,
  manageMeetingRegistrants,
  deleteRecording,
  getMeetingReport,
} from './tools';
import {
  meetingEvents,
  webinarEvents,
  recordingEvents,
  userEvents,
  chatMessageEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createMeeting,
    getMeeting,
    listMeetings,
    updateMeeting,
    deleteMeeting,
    listUsers,
    getUser,
    createWebinar,
    listWebinars,
    listRecordings,
    getMeetingRecordings,
    sendChatMessage,
    listChatChannels,
    getMeetingParticipants,
    manageMeetingRegistrants,
    deleteRecording,
    getMeetingReport,
  ],
  triggers: [
    meetingEvents,
    webinarEvents,
    recordingEvents,
    userEvents,
    chatMessageEvents,
  ],
});
