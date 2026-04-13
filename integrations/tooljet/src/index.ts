import { Slate } from 'slates';
import { spec } from './spec';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  updateUserRole,
  listWorkspaces,
  manageUserWorkspaces,
  listApps,
  exportApp,
  importApp,
  triggerWorkflow
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listUsers,
    getUser,
    createUser,
    updateUser,
    updateUserRole,
    listWorkspaces,
    manageUserWorkspaces,
    listApps,
    exportApp,
    importApp,
    triggerWorkflow
  ],
  triggers: [inboundWebhook]
});
