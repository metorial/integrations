import { Slate } from 'slates';
import { spec } from './spec';
import {
  queryGraph,
  pullData,
  getPage,
  createPage,
  updatePage,
  deletePage,
  createBlock,
  updateBlock,
  moveBlock,
  deleteBlock,
  addDailyNote,
  searchBlocks,
  batchActions
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    queryGraph,
    pullData,
    getPage,
    createPage,
    updatePage,
    deletePage,
    createBlock,
    updateBlock,
    moveBlock,
    deleteBlock,
    addDailyNote,
    searchBlocks,
    batchActions
  ],
  triggers: [inboundWebhook]
});
