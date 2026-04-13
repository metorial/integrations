import { Slate } from 'slates';
import { spec } from './spec';
import {
  getProfiles,
  createUpdateProfile,
  manageSubscriptions,
  manageLists,
  getListSegmentProfiles,
  getSegments,
  manageCampaigns,
  getFlows,
  updateFlowStatus,
  trackEvent,
  getEvents,
  getMetrics,
  queryMetricAggregates,
  manageCatalogItems,
  manageTemplates,
  manageTags,
  manageCoupons,
  requestProfileDeletion
} from './tools';
import { webhookEvents, newEvents, newProfiles } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getProfiles,
    createUpdateProfile,
    manageSubscriptions,
    manageLists,
    getListSegmentProfiles,
    getSegments,
    manageCampaigns,
    getFlows,
    updateFlowStatus,
    trackEvent,
    getEvents,
    getMetrics,
    queryMetricAggregates,
    manageCatalogItems,
    manageTemplates,
    manageTags,
    manageCoupons,
    requestProfileDeletion
  ],
  triggers: [webhookEvents, newEvents, newProfiles]
});
