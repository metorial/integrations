import { Slate } from 'slates';
import { spec } from './spec';
import {
  createNote,
  getNote,
  listNotes,
  searchNotes,
  deleteNote,
  createCollection,
  getCollection,
  listCollections,
  searchCollections,
  deleteCollection,
  memIt,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    createNote,
    getNote,
    listNotes,
    searchNotes,
    deleteNote,
    createCollection,
    getCollection,
    listCollections,
    searchCollections,
    deleteCollection,
    memIt,
  ],
  triggers: [
    inboundWebhook,
  ],
});
