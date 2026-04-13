import { Slate } from 'slates';
import { spec } from './spec';
import { getItem, getUser, listStories, search, getCommentTree } from './tools';
import { newStories, topStoriesChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [getItem, getUser, listStories, search, getCommentTree],
  triggers: [inboundWebhook, newStories, topStoriesChanges]
});
