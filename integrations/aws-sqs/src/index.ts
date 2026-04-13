import { Slate } from 'slates';
import { spec } from './spec';
import {
  createQueue,
  deleteQueue,
  listQueues,
  getQueueUrl,
  manageQueue,
  sendMessage,
  sendMessageBatch,
  receiveMessages,
  deleteMessage,
  purgeQueue,
  changeMessageVisibility,
  manageMessageMoveTask
} from './tools';
import { newMessage, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createQueue,
    deleteQueue,
    listQueues,
    getQueueUrl,
    manageQueue,
    sendMessage,
    sendMessageBatch,
    receiveMessages,
    deleteMessage,
    purgeQueue,
    changeMessageVisibility,
    manageMessageMoveTask
  ],
  triggers: [inboundWebhook, newMessage]
});
