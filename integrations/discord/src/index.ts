import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendMessage,
  manageMessages,
  manageGuild,
  manageChannels,
  manageMembers,
  manageInvites,
  manageThreads,
  manageRoles,
  manageReactions,
  manageWebhooks,
  getAuditLogTool,
  manageScheduledEventsTool,
  manageAutoModerationTool,
  manageApplicationCommands,
  manageEmojis
} from './tools';
import {
  newMessage,
  memberUpdate,
  guildUpdate,
  channelUpdate,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendMessage,
    manageMessages,
    manageGuild,
    manageChannels,
    manageMembers,
    manageInvites,
    manageThreads,
    manageRoles,
    manageReactions,
    manageWebhooks,
    getAuditLogTool,
    manageScheduledEventsTool,
    manageAutoModerationTool,
    manageApplicationCommands,
    manageEmojis
  ],
  triggers: [inboundWebhook, newMessage, memberUpdate, guildUpdate, channelUpdate]
});
