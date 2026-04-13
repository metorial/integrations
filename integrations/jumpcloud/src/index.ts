import { Slate } from 'slates';
import { spec } from './spec';
import {
  listUsers,
  getUser,
  manageUser,
  userActions,
  listSystems,
  getSystem,
  manageSystem,
  listGroups,
  manageUserGroup,
  manageSystemGroup,
  manageGroupMembership,
  manageAssociations,
  manageCommand,
  runCommand,
  listCommandResults,
  listApplications,
  queryEvents
} from './tools';
import {
  directoryEvents,
  authenticationEvents,
  systemEvents,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listUsers,
    getUser,
    manageUser,
    userActions,
    listSystems,
    getSystem,
    manageSystem,
    listGroups,
    manageUserGroup,
    manageSystemGroup,
    manageGroupMembership,
    manageAssociations,
    manageCommand,
    runCommand,
    listCommandResults,
    listApplications,
    queryEvents
  ],
  triggers: [inboundWebhook, directoryEvents, authenticationEvents, systemEvents]
});
