import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  queryMetrics,
  submitMetrics,
  manageMonitor,
  listMonitors,
  deleteMonitor,
  muteMonitor,
  manageDashboard,
  listDashboards,
  getDashboard,
  postEvent,
  listEvents,
  manageIncident,
  listIncidents,
  searchLogs,
  submitLogs,
  manageSlo,
  listSlos,
  manageSynthetics,
  listSyntheticsTests,
  triggerSynthetics,
  listUsers,
  listHosts,
  scheduleDowntime
} from './tools';
import {
  monitorAlertTrigger,
  newEventTrigger,
  incidentUpdateTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    queryMetrics,
    submitMetrics,
    manageMonitor,
    listMonitors,
    deleteMonitor,
    muteMonitor,
    manageDashboard,
    listDashboards,
    getDashboard,
    postEvent,
    listEvents,
    manageIncident,
    listIncidents,
    searchLogs,
    submitLogs,
    manageSlo,
    listSlos,
    manageSynthetics,
    listSyntheticsTests,
    triggerSynthetics,
    listUsers,
    listHosts,
    scheduleDowntime
  ],
  triggers: [
    inboundWebhook,
    monitorAlertTrigger,
    newEventTrigger,
    incidentUpdateTrigger
  ]
});
