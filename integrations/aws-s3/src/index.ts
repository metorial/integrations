import { Slate } from 'slates';
import { spec } from './spec';
import {
  listBucketsTool,
  manageBucketTool,
  listObjectsTool,
  getObjectTool,
  putObjectTool,
  deleteObjectsTool,
  copyObjectTool,
  generatePresignedUrlTool,
  manageObjectTagsTool,
  getBucketInfoTool,
  listObjectVersionsTool
} from './tools';
import { objectChangesTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listBucketsTool,
    manageBucketTool,
    listObjectsTool,
    getObjectTool,
    putObjectTool,
    deleteObjectsTool,
    copyObjectTool,
    generatePresignedUrlTool,
    manageObjectTagsTool,
    getBucketInfoTool,
    listObjectVersionsTool
  ],
  triggers: [inboundWebhook, objectChangesTrigger]
});
