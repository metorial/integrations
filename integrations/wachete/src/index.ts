import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  createMonitor,
  updateMonitor,
  getMonitor,
  deleteMonitor,
  searchMonitors,
  listNotifications,
  getHistory,
  listFolders,
  manageFolder,
  getCrawlerPages,
} from './tools';
import { contentChange,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createMonitor,
    updateMonitor,
    getMonitor,
    deleteMonitor,
    searchMonitors,
    listNotifications,
    getHistory,
    listFolders,
    manageFolder,
    getCrawlerPages,
  ],
  triggers: [
    inboundWebhook,
    contentChange,
  ],
});
