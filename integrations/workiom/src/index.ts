import { Slate } from 'slates';
import { spec } from './spec';
import {
  getApps,
  getListMetadata,
  queryRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  listWebhookSubscriptions,
  createWebhookSubscription,
  deleteWebhookSubscription
} from './tools';
import { recordEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getApps,
    getListMetadata,
    queryRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    listWebhookSubscriptions,
    createWebhookSubscription,
    deleteWebhookSubscription
  ],
  triggers: [
    recordEvent
  ]
});
