import { Slate } from 'slates';
import { spec } from './spec';
import {
  importEvents,
  trackEvents,
  manageUserProfile,
  manageGroupProfile,
  querySegmentation,
  queryFunnel,
  listFunnels,
  queryRetention,
  queryProfiles,
  exportEvents,
  manageAnnotations,
  manageIdentities,
  getActivityFeed,
  getTopEvents,
  listCohorts,
  queryInsights,
} from './tools';
import { cohortSync } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    importEvents,
    trackEvents,
    manageUserProfile,
    manageGroupProfile,
    querySegmentation,
    queryFunnel,
    listFunnels,
    queryRetention,
    queryProfiles,
    exportEvents,
    manageAnnotations,
    manageIdentities,
    getActivityFeed,
    getTopEvents,
    listCohorts,
    queryInsights,
  ],
  triggers: [
    cohortSync,
  ],
});
