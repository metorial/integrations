import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getPage,
  updatePage,
  listComponents,
  manageComponent,
  manageComponentGroup,
  listIncidents,
  getIncident,
  createIncident,
  updateIncident,
  listIncidentTemplates,
  manageSubscriber,
  listSubscribers,
  submitMetricData,
  managePostmortem,
} from './tools';
import {
  incidentUpdates,
  componentStatusChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getPage,
    updatePage,
    listComponents,
    manageComponent,
    manageComponentGroup,
    listIncidents,
    getIncident,
    createIncident,
    updateIncident,
    listIncidentTemplates,
    manageSubscriber,
    listSubscribers,
    submitMetricData,
    managePostmortem,
  ],
  triggers: [
    inboundWebhook,
    incidentUpdates,
    componentStatusChanges,
  ],
});
