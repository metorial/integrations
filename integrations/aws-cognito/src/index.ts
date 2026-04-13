import { Slate } from 'slates';
import { spec } from './spec';
import {
  listUserPools,
  manageUserPool,
  listUsers,
  manageUser,
  listGroups,
  manageGroup,
  manageGroupMembership,
  manageIdentityProvider,
  manageAppClient,
  manageIdentityPool
} from './tools';
import { userChanges, groupChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listUserPools,
    manageUserPool,
    listUsers,
    manageUser,
    listGroups,
    manageGroup,
    manageGroupMembership,
    manageIdentityProvider,
    manageAppClient,
    manageIdentityPool
  ],
  triggers: [inboundWebhook, userChanges, groupChanges]
});
