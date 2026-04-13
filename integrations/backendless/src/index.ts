import { Slate } from 'slates';
import { spec } from './spec';
import {
  createObject,
  queryObjects,
  updateObject,
  deleteObject,
  findUsers,
  registerUser,
  listFiles,
  deleteFile,
  publishMessage,
  sendEmail,
  manageCounter,
  manageCache
} from './tools';
import { dataChanges, newUser, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createObject,
    queryObjects,
    updateObject,
    deleteObject,
    findUsers,
    registerUser,
    listFiles,
    deleteFile,
    publishMessage,
    sendEmail,
    manageCounter,
    manageCache
  ],
  triggers: [inboundWebhook, dataChanges, newUser]
});
