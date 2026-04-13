import { Slate } from 'slates';
import { spec } from './spec';
import {
  createTopic,
  deleteTopic,
  listTopics,
  getTopic,
  updateTopic,
  publishMessage,
  subscribeToTopic,
  unsubscribeFromTopic,
  listSubscriptions,
  updateSubscription,
  confirmSubscription,
  sendSms
} from './tools';
import { topicNotification } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createTopic,
    deleteTopic,
    listTopics,
    getTopic,
    updateTopic,
    publishMessage,
    subscribeToTopic,
    unsubscribeFromTopic,
    listSubscriptions,
    updateSubscription,
    confirmSubscription,
    sendSms
  ],
  triggers: [topicNotification]
});
