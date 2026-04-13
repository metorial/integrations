import { Slate } from 'slates';
import { spec } from './spec';
import {
  listPipelines,
  getPipeline,
  runPipeline,
  deletePipeline,
  listJobs,
  manageJob,
  manageVariables,
  manageEnvironments,
  manageRunners,
  manageSchedules,
  manageTriggers,
  lintCiConfig,
  listDeployments,
  getTestReport
} from './tools';
import {
  pipelineEvents,
  jobEvents,
  deploymentEvents,
  pushEvents,
  mergeRequestEvents,
  tagPushEvents,
  releaseEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listPipelines,
    getPipeline,
    runPipeline,
    deletePipeline,
    listJobs,
    manageJob,
    manageVariables,
    manageEnvironments,
    manageRunners,
    manageSchedules,
    manageTriggers,
    lintCiConfig,
    listDeployments,
    getTestReport
  ],
  triggers: [
    pipelineEvents,
    jobEvents,
    deploymentEvents,
    pushEvents,
    mergeRequestEvents,
    tagPushEvents,
    releaseEvents
  ]
});
