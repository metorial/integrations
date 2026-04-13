import { Slate } from 'slates';
import { spec } from './spec';
import {
  createPage,
  getPage,
  updatePage,
  search,
  queryDatabase,
  getDatabase,
  createDatabase,
  updateDatabase,
  getBlockChildren,
  appendBlocks,
  updateBlock,
  deleteBlock,
  addComment,
  listComments,
  listUsers,
} from './tools';
import {
  pageEvents,
  commentEvents,
  databaseEvents,
  pageUpdates,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createPage,
    getPage,
    updatePage,
    search,
    queryDatabase,
    getDatabase,
    createDatabase,
    updateDatabase,
    getBlockChildren,
    appendBlocks,
    updateBlock,
    deleteBlock,
    addComment,
    listComments,
    listUsers,
  ],
  triggers: [
    pageEvents,
    commentEvents,
    databaseEvents,
    pageUpdates,
  ],
});
