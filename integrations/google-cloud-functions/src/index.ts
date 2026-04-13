import { Slate } from 'slates';
import { spec } from './spec';
import {
  listFunctions,
  getFunction,
  createFunction,
  updateFunction,
  deleteFunction,
  listRuntimes,
  generateUploadUrl,
  generateDownloadUrl,
  manageIamPolicy,
  getOperation
} from './tools';
import { functionChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listFunctions,
    getFunction,
    createFunction,
    updateFunction,
    deleteFunction,
    listRuntimes,
    generateUploadUrl,
    generateDownloadUrl,
    manageIamPolicy,
    getOperation
  ],
  triggers: [inboundWebhook, functionChanges]
});
