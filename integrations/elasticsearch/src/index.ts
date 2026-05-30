import { Slate } from 'slates';
import { spec } from './spec';
import {
  bulkOperationsTool,
  clusterHealthTool,
  deleteDocumentTool,
  esqlQueryTool,
  getDocumentTool,
  graphExploreTool,
  indexDocumentTool,
  listIndicesTool,
  manageAliasTool,
  manageIndexTool,
  managePipelineTool,
  manageSecurityTool,
  manageSnapshotTool,
  manageWatchTool,
  reindexTool,
  runInferenceTool,
  searchDocumentsTool,
  updateDocumentTool
} from './tools';
import { inboundWebhook, watcherAlertTrigger } from './triggers';

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
