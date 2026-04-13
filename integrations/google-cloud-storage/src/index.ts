import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listBuckets,
  getBucket,
  manageBucket,
  listObjects,
  getObject,
  uploadObject,
  deleteObject,
  copyObject,
  updateObjectMetadata,
  manageBucketIam,
  manageLifecycle,
  manageNotifications,
} from './tools';
import { objectChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listBuckets,
    getBucket,
    manageBucket,
    listObjects,
    getObject,
    uploadObject,
    deleteObject,
    copyObject,
    updateObjectMetadata,
    manageBucketIam,
    manageLifecycle,
    manageNotifications,
  ],
  triggers: [
    inboundWebhook,
    objectChanges,
  ],
});
