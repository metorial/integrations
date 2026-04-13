import { Slate } from 'slates';
import { spec } from './spec';
import {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecords,
  upsertRecords,
  searchRecords,
  listNotes,
  createNote,
  deleteNote,
  listTags,
  createTag,
  addTagsToRecords,
  removeTagsFromRecord,
  getModules,
  getModuleFields,
  getModuleLayouts,
  getCustomViews,
  getRelatedRecords,
  getUsers,
} from './tools';
import { recordEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecords,
    upsertRecords,
    searchRecords,
    listNotes,
    createNote,
    deleteNote,
    listTags,
    createTag,
    addTagsToRecords,
    removeTagsFromRecord,
    getModules,
    getModuleFields,
    getModuleLayouts,
    getCustomViews,
    getRelatedRecords,
    getUsers,
  ],
  triggers: [
    recordEvents,
  ],
});
