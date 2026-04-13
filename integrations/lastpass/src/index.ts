import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getUsers,
  provisionUsers,
  deprovisionUser,
  manageUser,
  manageGroupMembership,
  getSharedFolders,
  getEventReport,
} from './tools';
import {
  accountEvents,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getUsers,
    provisionUsers,
    deprovisionUser,
    manageUser,
    manageGroupMembership,
    getSharedFolders,
    getEventReport,
  ],
  triggers: [
    inboundWebhook,
    accountEvents,
  ],
});
