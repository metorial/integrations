import { Slate } from 'slates';
import { spec } from './spec';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  listRoles,
  manageRole,
  listApps,
  getApp,
  manageApp,
  listGroups,
  listEvents,
  getEventTypes,
  manageUserRoles,
  getMfaFactors,
  enrollMfaFactor,
  verifyMfaFactor,
} from './tools';
import {
  accountEvents,
  eventWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listUsers.build(),
    getUser.build(),
    createUser.build(),
    updateUser.build(),
    deleteUser.build(),
    listRoles.build(),
    manageRole.build(),
    listApps.build(),
    getApp.build(),
    manageApp.build(),
    listGroups.build(),
    listEvents.build(),
    getEventTypes.build(),
    manageUserRoles.build(),
    getMfaFactors.build(),
    enrollMfaFactor.build(),
    verifyMfaFactor.build(),
  ],
  triggers: [
    accountEvents.build(),
    eventWebhook.build(),
  ],
});
