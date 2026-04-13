import { Slate } from 'slates';
import { spec } from './spec';
import {
  listMonitors,
  createMonitor,
  updateMonitor,
  deleteMonitor,
  listAlertContacts,
  createAlertContact,
  deleteAlertContact,
  listStatusPages,
  createStatusPage,
  deleteStatusPage,
  listMaintenanceWindows,
  createMaintenanceWindow,
  deleteMaintenanceWindow,
  getAccountDetails
} from './tools';
import { monitorStatusChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listMonitors,
    createMonitor,
    updateMonitor,
    deleteMonitor,
    listAlertContacts,
    createAlertContact,
    deleteAlertContact,
    listStatusPages,
    createStatusPage,
    deleteStatusPage,
    listMaintenanceWindows,
    createMaintenanceWindow,
    deleteMaintenanceWindow,
    getAccountDetails
  ],
  triggers: [inboundWebhook, monitorStatusChanges]
});
