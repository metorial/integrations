import { Slate } from 'slates';
import { spec } from './spec';
import {
  getMetadata,
  getProfileAnalytics,
  getPostAnalytics,
  getMessages,
  createDraftPost,
  uploadMedia,
  getListeningMessages,
  getListeningMetrics,
  getCases,
  getPublishingPost
} from './tools';
import { newMessages, newCases, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getMetadata.build(),
    getProfileAnalytics.build(),
    getPostAnalytics.build(),
    getMessages.build(),
    createDraftPost.build(),
    uploadMedia.build(),
    getListeningMessages.build(),
    getListeningMetrics.build(),
    getCases.build(),
    getPublishingPost.build()
  ],
  triggers: [inboundWebhook, newMessages.build(), newCases.build()]
});
