import { Slate } from 'slates';
import { spec } from './spec';
import {
  runSearch,
  getSearchResults,
  listSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  dispatchSavedSearch,
  sendHecEvent,
  sendHecRawEvent,
  listIndexes,
  createIndex,
  getIndex,
  listKVStoreCollections,
  createKVStoreCollection,
  deleteKVStoreCollection,
  queryKVStoreRecords,
  upsertKVStoreRecord,
  deleteKVStoreRecords,
  listUsers,
  getCurrentUser,
  getServerInfo,
  listFiredAlerts
} from './tools';
import { alertFired } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    runSearch,
    getSearchResults,
    listSavedSearches,
    createSavedSearch,
    updateSavedSearch,
    deleteSavedSearch,
    dispatchSavedSearch,
    sendHecEvent,
    sendHecRawEvent,
    listIndexes,
    createIndex,
    getIndex,
    listKVStoreCollections,
    createKVStoreCollection,
    deleteKVStoreCollection,
    queryKVStoreRecords,
    upsertKVStoreRecord,
    deleteKVStoreRecords,
    listUsers,
    getCurrentUser,
    getServerInfo,
    listFiredAlerts
  ],
  triggers: [
    alertFired
  ]
});
