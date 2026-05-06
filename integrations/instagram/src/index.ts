import { Slate } from 'slates';
import { spec } from './spec';
import {
  getProfileTool,
  getMediaTool,
  publishMediaTool,
  manageCommentsTool,
  getInsightsTool,
  searchHashtagsTool,
  sendMessageTool,
  getMentionsTool,
  getStoriesTool,
  getPublishingLimitTool
} from './tools';
import { newMediaTrigger, webhookEventsTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getProfileTool,
    getMediaTool,
    publishMediaTool,
    manageCommentsTool,
    getInsightsTool,
    searchHashtagsTool,
    sendMessageTool,
    getMentionsTool,
    getStoriesTool,
    getPublishingLimitTool
  ],
  triggers: [newMediaTrigger, webhookEventsTrigger]
});
