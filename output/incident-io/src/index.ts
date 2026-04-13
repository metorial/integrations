import { Slate } from 'slates';
import { spec } from './spec';
import {
  listIncidents,
  getIncident,
  createIncident,
  editIncident,
  listAlerts,
  sendAlertEvent,
  listSchedules,
  getScheduleEntries,
  createScheduleOverride,
  listCatalogTypes,
  listCatalogEntries,
  manageCatalogEntry,
  listSeveritiesAndStatuses,
  listIncidentRolesAndTypes,
  listFollowUps,
  manageStatusPageIncident,
  listUsers,
  listWorkflows,
} from './tools';
import {
  incidentEvents,
  followUpEvents,
  alertEvents,
  incidentMembershipEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listIncidents,
    getIncident,
    createIncident,
    editIncident,
    listAlerts,
    sendAlertEvent,
    listSchedules,
    getScheduleEntries,
    createScheduleOverride,
    listCatalogTypes,
    listCatalogEntries,
    manageCatalogEntry,
    listSeveritiesAndStatuses,
    listIncidentRolesAndTypes,
    listFollowUps,
    manageStatusPageIncident,
    listUsers,
    listWorkflows,
  ],
  triggers: [
    incidentEvents,
    followUpEvents,
    alertEvents,
    incidentMembershipEvents,
  ],
});
