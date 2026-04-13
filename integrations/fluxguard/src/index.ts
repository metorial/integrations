import { Slate } from 'slates';
import { spec } from './spec';
import {
  addPage,
  getPage,
  deletePage,
  deleteSite,
  startCrawl,
  listCategories,
  createCategory,
  listWebhooks,
  createWebhook,
  deleteWebhook,
  getWebhookSample,
  getAccount,
} from './tools';
import {
  pageChangeTrigger,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    addPage,
    getPage,
    deletePage,
    deleteSite,
    startCrawl,
    listCategories,
    createCategory,
    listWebhooks,
    createWebhook,
    deleteWebhook,
    getWebhookSample,
    getAccount,
  ],
  triggers: [
    pageChangeTrigger,
  ],
});
