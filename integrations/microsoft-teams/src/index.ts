import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  listChannels,
  manageChannel,
  sendChannelMessage,
  listChannelMessages,
  listChats,
  sendChatMessage,
  listChatMessages,
  manageMembers,
  manageOnlineMeeting,
  getPresence,
  manageTags,
  manageShifts,
} from './tools';
import {
  channelMessageTrigger,
  chatMessageTrigger,
  teamChangeTrigger,
  membershipChangeTrigger,
  channelChangeTrigger,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTeams,
    getTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    listChannels,
    manageChannel,
    sendChannelMessage,
    listChannelMessages,
    listChats,
    sendChatMessage,
    listChatMessages,
    manageMembers,
    manageOnlineMeeting,
    getPresence,
    manageTags,
    manageShifts,
  ],
  triggers: [
    channelMessageTrigger,
    chatMessageTrigger,
    teamChangeTrigger,
    membershipChangeTrigger,
    channelChangeTrigger,
  ],
});
