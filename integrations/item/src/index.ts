import { Slate } from 'slates';
import { spec } from './spec';
import {
  listObjects,
  getObject,
  createObject,
  updateObject,
  deleteObject,
  batchUpsertObjects,
  getSchema,
  listUsers,
  listViews,
  executeView,
  triggerSkillWebhook
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listObjects,
    getObject,
    createObject,
    updateObject,
    deleteObject,
    batchUpsertObjects,
    getSchema,
    listUsers,
    listViews,
    executeView,
    triggerSkillWebhook
  ],
  triggers: [inboundWebhook]
});
