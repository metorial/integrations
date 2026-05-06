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
  getUserSettings,
  createWebinar,
  getWebinar,
  updateWebinar,
  deleteWebinar,
  listWebinars,
  listRecordings,
  getMeetingRecordings,
  sendChatMessage,
  manageChatMessages,
  listChatChannels,
  getMeetingParticipants,
  manageMeetingRegistrants,
  manageMeetingPolls,
  getMeetingInvitation,
  deleteRecording,
  getMeetingReport
} from './tools';
import {
  meetingEvents,
  webinarEvents,
  recordingEvents,
  userEvents,
  chatMessageEvents
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
    getUserSettings,
    createWebinar,
    getWebinar,
    updateWebinar,
    deleteWebinar,
    listWebinars,
    listRecordings,
    getMeetingRecordings,
    sendChatMessage,
    manageChatMessages,
    listChatChannels,
    getMeetingParticipants,
    manageMeetingRegistrants,
    manageMeetingPolls,
    getMeetingInvitation,
    deleteRecording,
    getMeetingReport
  ],
  triggers: [meetingEvents, webinarEvents, recordingEvents, userEvents, chatMessageEvents]
});
