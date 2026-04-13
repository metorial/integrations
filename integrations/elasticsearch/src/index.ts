import { Slate } from 'slates';
import { spec } from './spec';
import {
  indexDocumentTool,
  getDocumentTool,
  updateDocumentTool,
  deleteDocumentTool,
  bulkOperationsTool,
  searchDocumentsTool,
  esqlQueryTool,
  manageIndexTool,
  listIndicesTool,
  manageAliasTool,
  clusterHealthTool,
  managePipelineTool,
  runInferenceTool,
  manageSnapshotTool,
  manageSecurityTool,
  manageWatchTool,
  reindexTool,
  graphExploreTool
} from './tools';
import { watcherAlertTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    indexDocumentTool,
    getDocumentTool,
    updateDocumentTool,
    deleteDocumentTool,
    bulkOperationsTool,
    searchDocumentsTool,
    esqlQueryTool,
    manageIndexTool,
    listIndicesTool,
    manageAliasTool,
    clusterHealthTool,
    managePipelineTool,
    runInferenceTool,
    manageSnapshotTool,
    manageSecurityTool,
    manageWatchTool,
    reindexTool,
    graphExploreTool
  ],
  triggers: [inboundWebhook, watcherAlertTrigger]
});
