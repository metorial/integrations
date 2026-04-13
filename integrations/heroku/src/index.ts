import { Slate } from 'slates';
import { spec } from './spec';
import {
  listApps,
  getApp,
  createApp,
  updateApp,
  deleteApp,
  manageDynos,
  scaleFormation,
  manageAddons,
  manageConfigVars,
  manageBuilds,
  manageReleases,
  manageDomains,
  manageCollaborators,
  managePipelines,
  manageLogDrains,
  getAccount
} from './tools';
import { appWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listApps,
    getApp,
    createApp,
    updateApp,
    deleteApp,
    manageDynos,
    scaleFormation,
    manageAddons,
    manageConfigVars,
    manageBuilds,
    manageReleases,
    manageDomains,
    manageCollaborators,
    managePipelines,
    manageLogDrains,
    getAccount
  ],
  triggers: [appWebhook]
});
