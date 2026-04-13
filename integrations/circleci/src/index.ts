import { Slate } from 'slates';
import { spec } from './spec';
import {
  triggerPipeline,
  getPipeline,
  listPipelines,
  getWorkflow,
  manageWorkflow,
  getJob,
  cancelJob,
  getProject,
  manageProjectEnvVars,
  manageContexts,
  manageContextEnvVars,
  getInsights,
  getFlakyTests,
  manageSchedules,
  manageWebhooks,
  getUser
} from './tools';
import { buildEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    triggerPipeline,
    getPipeline,
    listPipelines,
    getWorkflow,
    manageWorkflow,
    getJob,
    cancelJob,
    getProject,
    manageProjectEnvVars,
    manageContexts,
    manageContextEnvVars,
    getInsights,
    getFlakyTests,
    manageSchedules,
    manageWebhooks,
    getUser
  ],
  triggers: [buildEvent]
});
