import { Slate } from 'slates';
import { spec } from './spec';
import {
  listWorkflows,
  getWorkflowDetails,
  getWorkflowData,
  runWorkflow,
  manageWorkflow,
  startCrawl,
  getCrawlResults,
  adhocExtraction,
  getDataChanges
} from './tools';
import { kadoaEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listWorkflows,
    getWorkflowDetails,
    getWorkflowData,
    runWorkflow,
    manageWorkflow,
    startCrawl,
    getCrawlResults,
    adhocExtraction,
    getDataChanges
  ],
  triggers: [kadoaEvents]
});
