import { Slate } from 'slates';
import { spec } from './spec';
import {
  listMonitors,
  manageMonitor,
  listIncidents,
  manageIncident,
  manageHeartbeat,
  manageStatusPage,
  manageOnCall,
  manageSource,
  listDashboards,
  manageAlert,
  manageIncomingWebhook
} from './tools';
import { incidentEvents, monitorEvents, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listMonitors,
    manageMonitor,
    listIncidents,
    manageIncident,
    manageHeartbeat,
    manageStatusPage,
    manageOnCall,
    manageSource,
    listDashboards,
    manageAlert,
    manageIncomingWebhook
  ],
  triggers: [inboundWebhook, incidentEvents, monitorEvents]
});
