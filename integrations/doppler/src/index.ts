import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageSecrets,
  manageProjects,
  manageEnvironments,
  manageConfigs,
  downloadSecrets,
  configLogs,
  activityLogs,
  shareSecret,
  manageWebhooks,
  manageTrustedIps,
  getWorkplace
} from './tools';
import { secretChanged } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageSecrets,
    manageProjects,
    manageEnvironments,
    manageConfigs,
    downloadSecrets,
    configLogs,
    activityLogs,
    shareSecret,
    manageWebhooks,
    manageTrustedIps,
    getWorkplace
  ],
  triggers: [secretChanged]
});
