import { Slate } from 'slates';
import { spec } from './spec';
import {
  listIncidents,
  getIncident,
  createIncident,
  updateIncident,
  listServices,
  manageService,
  listUsers,
  listOnCalls,
  listEscalationPolicies,
  listSchedules,
  listTeams,
  sendEvent,
  manageMaintenanceWindow,
  getAnalytics,
  listPriorities,
} from './tools';
import {
  incidentEvents,
  serviceEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listIncidents,
    getIncident,
    createIncident,
    updateIncident,
    listServices,
    manageService,
    listUsers,
    listOnCalls,
    listEscalationPolicies,
    listSchedules,
    listTeams,
    sendEvent,
    manageMaintenanceWindow,
    getAnalytics,
    listPriorities,
  ],
  triggers: [
    incidentEvents,
    serviceEvents,
  ],
});
