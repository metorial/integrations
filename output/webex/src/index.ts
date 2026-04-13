import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendMessage,
  getMessage,
  listMessages,
  editMessage,
  deleteMessage,
  createSpace,
  updateSpace,
  deleteSpace,
  getSpace,
  listSpaces,
  addMember,
  updateMember,
  removeMember,
  listMemberships,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getMeeting,
  listMeetings,
  listPeople,
  getPersonDetails,
  listRecordings,
  getRecording,
  listTeams,
  createTeam,
  deleteTeam
} from './tools';
import {
  messageEvents,
  roomEvents,
  membershipEvents,
  meetingEvents,
  attachmentActionEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendMessage,
    getMessage,
    listMessages,
    editMessage,
    deleteMessage,
    createSpace,
    updateSpace,
    deleteSpace,
    getSpace,
    listSpaces,
    addMember,
    updateMember,
    removeMember,
    listMemberships,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    getMeeting,
    listMeetings,
    listPeople,
    getPersonDetails,
    listRecordings,
    getRecording,
    listTeams,
    createTeam,
    deleteTeam
  ],
  triggers: [
    messageEvents,
    roomEvents,
    membershipEvents,
    meetingEvents,
    attachmentActionEvents
  ]
});
