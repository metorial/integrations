import { Slate } from 'slates';
import { spec } from './spec';
import {
  listEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  getSingleType,
  updateSingleType,
  listMedia,
  getMedia,
  uploadMedia,
  updateMedia,
  deleteMedia
} from './tools';
import { entryEvents, mediaEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listEntries,
    getEntry,
    createEntry,
    updateEntry,
    deleteEntry,
    getSingleType,
    updateSingleType,
    listMedia,
    getMedia,
    uploadMedia,
    updateMedia,
    deleteMedia
  ],
  triggers: [entryEvents, mediaEvents]
});
