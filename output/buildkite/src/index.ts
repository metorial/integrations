import { Slate } from 'slates';
import { spec } from './spec';
import {
  listPipelines,
  getPipeline,
  createPipeline,
  updatePipeline,
  deletePipeline,
  archivePipeline,
  listBuilds,
  getBuild,
  createBuild,
  manageBuild,
  manageJob,
  getJobLog,
  listAgents,
  stopAgent,
  listArtifacts,
  createAnnotation,
} from './tools';
import {
  buildEvents,
  jobEvents,
  agentEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listPipelines.build(),
    getPipeline.build(),
    createPipeline.build(),
    updatePipeline.build(),
    deletePipeline.build(),
    archivePipeline.build(),
    listBuilds.build(),
    getBuild.build(),
    createBuild.build(),
    manageBuild.build(),
    manageJob.build(),
    getJobLog.build(),
    listAgents.build(),
    stopAgent.build(),
    listArtifacts.build(),
    createAnnotation.build(),
  ],
  triggers: [
    buildEvents.build(),
    jobEvents.build(),
    agentEvents.build(),
  ],
});
