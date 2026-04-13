import {
  Slate } from 'slates';
import { spec } from './spec';
import { publishMessage, pollMessages, updateNotification } from './tools';
import { topicMessages,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [publishMessage, pollMessages, updateNotification],
  triggers: [
    inboundWebhook,topicMessages],
});
