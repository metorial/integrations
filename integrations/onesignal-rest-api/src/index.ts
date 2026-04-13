import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendNotification,
  viewNotifications,
  cancelNotification,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  transferSubscription,
  createSegment,
  listSegments,
  deleteSegment,
  createTemplate,
  listTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  listApps,
  getApp,
  createApp,
  updateApp,
  exportData
} from './tools';
import { notificationEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendNotification,
    viewNotifications,
    cancelNotification,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    transferSubscription,
    createSegment,
    listSegments,
    deleteSegment,
    createTemplate,
    listTemplates,
    getTemplate,
    updateTemplate,
    deleteTemplate,
    listApps,
    getApp,
    createApp,
    updateApp,
    exportData
  ],
  triggers: [notificationEvents]
});
