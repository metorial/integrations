import { Slate } from 'slates';
import { spec } from './spec';
import {
  listIncidents,
  getIncident,
  createIncident,
  updateIncident,
  listAlerts,
  createAlert,
  manageAlert,
  listOnCall,
  listSchedules,
  listEscalationPolicies,
  listServices,
  listTeams,
  listUsers,
  listActionItems,
  createActionItem,
  updateActionItem,
  listHeartbeats,
  createHeartbeat,
  listWorkflows,
  listSeverities,
  listEnvironments
} from './tools';
import {
  incidentEvents,
  alertEvents,
  retrospectiveEvents,
  scheduledIncidentEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listIncidents,
    getIncident,
    createIncident,
    updateIncident,
    listAlerts,
    createAlert,
    manageAlert,
    listOnCall,
    listSchedules,
    listEscalationPolicies,
    listServices,
    listTeams,
    listUsers,
    listActionItems,
    createActionItem,
    updateActionItem,
    listHeartbeats,
    createHeartbeat,
    listWorkflows,
    listSeverities,
    listEnvironments
  ],
  triggers: [incidentEvents, alertEvents, retrospectiveEvents, scheduledIncidentEvents]
});
