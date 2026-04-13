import { Slate } from 'slates';
import { spec } from './spec';
import {
  listApplications,
  getApplication,
  addApplication,
  startBuild,
  getBuild,
  listBuilds,
  cancelBuild,
  createArtifactUrl,
  manageCaches,
  addVariables
} from './tools';
import { buildStatusTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listApplications,
    getApplication,
    addApplication,
    startBuild,
    getBuild,
    listBuilds,
    cancelBuild,
    createArtifactUrl,
    manageCaches,
    addVariables
  ],
  triggers: [inboundWebhook, buildStatusTrigger]
});
