import { Slate } from 'slates';
import { spec } from './spec';
import {
  publishMessage,
  getMessageHistory,
  getPresence,
  getPresenceHistory,
  getChannelStatus,
  getStatistics,
  requestToken,
  revokeTokens,
  manageApps,
  manageKeys,
  manageRules,
  manageQueues,
  manageNamespaces,
} from './tools';
import { channelEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    publishMessage,
    getMessageHistory,
    getPresence,
    getPresenceHistory,
    getChannelStatus,
    getStatistics,
    requestToken,
    revokeTokens,
    manageApps,
    manageKeys,
    manageRules,
    manageQueues,
    manageNamespaces,
  ],
  triggers: [
    channelEvents,
  ],
});
