import { Slate } from 'slates';
import { spec } from './spec';
import {
  listFolder,
  getFileInfo,
  manageFile,
  createFolder,
  listUsers,
  manageUser,
  manageGroup,
  managePermission,
  manageShareLink,
  manageAutomation,
  manageNotification,
  searchHistory
} from './tools';
import { fileActivity, actionLog } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listFolder,
    getFileInfo,
    manageFile,
    createFolder,
    listUsers,
    manageUser,
    manageGroup,
    managePermission,
    manageShareLink,
    manageAutomation,
    manageNotification,
    searchHistory
  ],
  triggers: [fileActivity, actionLog]
});
