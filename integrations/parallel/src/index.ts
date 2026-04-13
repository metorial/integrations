import { Slate } from 'slates';
import { spec } from './spec';
import {
  webSearch,
  extractContent,
  deepResearch,
  getTaskRun,
  chatCompletion,
  findEntities,
  getFindallResults,
  ingestFindall,
  enrichFindall,
  createMonitor,
  manageMonitor
} from './tools';
import { monitorEvents, taskRunEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    webSearch,
    extractContent,
    deepResearch,
    getTaskRun,
    chatCompletion,
    findEntities,
    getFindallResults,
    ingestFindall,
    enrichFindall,
    createMonitor,
    manageMonitor
  ],
  triggers: [monitorEvents, taskRunEvents]
});
