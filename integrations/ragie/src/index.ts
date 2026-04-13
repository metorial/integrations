import { Slate } from 'slates';
import { spec } from './spec';
import {
  createDocument,
  listDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  retrieveDocuments,
  createResponse,
  manageInstructions,
  getEntities,
  manageConnections,
  managePartitions,
} from './tools';
import {
  documentEvents,
  connectionEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createDocument,
    listDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
    retrieveDocuments,
    createResponse,
    manageInstructions,
    getEntities,
    manageConnections,
    managePartitions,
  ],
  triggers: [
    documentEvents,
    connectionEvents,
  ],
});
