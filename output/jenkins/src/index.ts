import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listJobs,
  getJob,
  getJobConfig,
  manageJob,
  triggerBuild,
  getBuild,
  listBuilds,
  stopBuild,
  manageQueue,
  manageView,
  manageNode,
  managePlugins,
  manageCredentials,
  manageFolder,
  executeScript,
  getSystemInfo
} from './tools';
import {
  buildEvent,
  jobStatusChange,
  inboundWebhook,
} from './triggers';

export let jenkins = Slate.create({
  spec,
  tools: [
    listJobs,
    getJob,
    getJobConfig,
    manageJob,
    triggerBuild,
    getBuild,
    listBuilds,
    stopBuild,
    manageQueue,
    manageView,
    manageNode,
    managePlugins,
    manageCredentials,
    manageFolder,
    executeScript,
    getSystemInfo
  ],
  triggers: [
    inboundWebhook,
    buildEvent,
    jobStatusChange
  ]
});
