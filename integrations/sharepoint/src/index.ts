import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getSite,
  listSites,
  search,
  searchDrive,
  manageList,
  manageListItems,
  manageFile,
  getDrive,
  getFileVersions,
  managePermissions,
  manageColumns,
  getContentTypes,
} from './tools';
import {
  listItemChanges,
  driveItemChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getSite,
    listSites,
    search,
    searchDrive,
    manageList,
    manageListItems,
    manageFile,
    getDrive,
    getFileVersions,
    managePermissions,
    manageColumns,
    getContentTypes,
  ],
  triggers: [
    inboundWebhook,
    listItemChanges,
    driveItemChanges,
  ],
});
