import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  createObject,
  getObject,
  updateObject,
  deleteObject,
  listObjects,
  batchCreateObjects,
  batchDeleteObjects,
  searchObjects,
  generativeSearch,
  aggregateCollection,
  manageTenants,
  manageBackup,
  manageReferences,
  clusterStatus,
} from './tools/index';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listCollections,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    createObject,
    getObject,
    updateObject,
    deleteObject,
    listObjects,
    batchCreateObjects,
    batchDeleteObjects,
    searchObjects,
    generativeSearch,
    aggregateCollection,
    manageTenants,
    manageBackup,
    manageReferences,
    clusterStatus,
  ],
  triggers: [
    inboundWebhook,
  ],
});
