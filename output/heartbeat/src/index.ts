import { Slate } from 'slates';
import { spec } from './spec';
import {
  createMember,
  updateMember,
  findUser,
  listMembers,
  deactivateMember,
  manageGroup,
  listGroups,
  createThread,
  createComment,
  createChannel,
  listChannels,
  createEvent,
  sendDirectMessage,
  sendInvitation,
  getRecentPosts,
} from './tools';
import {
  communityEvents,
  newPosts,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createMember,
    updateMember,
    findUser,
    listMembers,
    deactivateMember,
    manageGroup,
    listGroups,
    createThread,
    createComment,
    createChannel,
    listChannels,
    createEvent,
    sendDirectMessage,
    sendInvitation,
    getRecentPosts,
  ],
  triggers: [
    communityEvents,
    newPosts,
  ],
});
