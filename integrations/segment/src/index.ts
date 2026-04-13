import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageSource,
  listSources,
  getSource,
  manageDestination,
  listDestinations,
  manageDestinationFilter,
  trackEvent,
  identifyUser,
  pageScreen,
  groupUser,
  aliasUser,
  batchEvents,
  manageTrackingPlan,
  listTrackingPlans,
  manageWarehouse,
  listWarehouses,
  manageTransformation,
  manageFunction,
  manageReverseEtl,
  browseCatalog,
  createRegulation,
  getUsage,
  listAuditEvents
} from './tools';
import { workspaceActivityTrigger, eventWebhookTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageSource,
    listSources,
    getSource,
    manageDestination,
    listDestinations,
    manageDestinationFilter,
    trackEvent,
    identifyUser,
    pageScreen,
    groupUser,
    aliasUser,
    batchEvents,
    manageTrackingPlan,
    listTrackingPlans,
    manageWarehouse,
    listWarehouses,
    manageTransformation,
    manageFunction,
    manageReverseEtl,
    browseCatalog,
    createRegulation,
    getUsage,
    listAuditEvents
  ],
  triggers: [workspaceActivityTrigger, eventWebhookTrigger]
});
