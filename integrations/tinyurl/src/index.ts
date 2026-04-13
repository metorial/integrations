import { Slate } from 'slates';
import { spec } from './spec';
import {
  createTinyUrl,
  getTinyUrl,
  listTinyUrls,
  updateTinyUrl,
  deleteTinyUrl,
  archiveTinyUrl,
  getAnalytics
} from './tools';
import { newTinyUrl, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createTinyUrl,
    getTinyUrl,
    listTinyUrls,
    updateTinyUrl,
    deleteTinyUrl,
    archiveTinyUrl,
    getAnalytics
  ],
  triggers: [inboundWebhook, newTinyUrl]
});
