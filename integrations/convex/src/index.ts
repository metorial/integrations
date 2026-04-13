import { Slate } from 'slates';
import { spec } from './spec';
import {
  runQuery,
  runMutation,
  runAction,
  listDocuments,
  getDocumentDeltas,
  manageEnvironmentVariables,
  generateUploadUrl
} from './tools';
import { dataChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    runQuery,
    runMutation,
    runAction,
    listDocuments,
    getDocumentDeltas,
    manageEnvironmentVariables,
    generateUploadUrl
  ],
  triggers: [inboundWebhook, dataChanges]
});
