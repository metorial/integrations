import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  addBookmark,
  deleteBookmark,
  getBookmarks,
  listRecentBookmarks,
  listAllBookmarks,
  getTagSuggestions,
  listTags,
  manageTag,
  checkForUpdates,
  getBookmarkDates,
} from './tools';
import { bookmarkUpdated,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    addBookmark,
    deleteBookmark,
    getBookmarks,
    listRecentBookmarks,
    listAllBookmarks,
    getTagSuggestions,
    listTags,
    manageTag,
    checkForUpdates,
    getBookmarkDates,
  ],
  triggers: [
    inboundWebhook,
    bookmarkUpdated,
  ],
});
