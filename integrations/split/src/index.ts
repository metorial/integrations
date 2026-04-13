import { Slate } from 'slates';
import { spec } from './spec';
import {
  listFeatureFlags,
  getFeatureFlag,
  createFeatureFlag,
  updateFeatureFlag,
  deleteFeatureFlag,
  listEnvironments,
  manageEnvironment,
  manageSegment,
  listSegments,
  listWorkspaces,
  manageFlagSet,
  manageUsers,
  manageGroups,
  listTrafficTypes
} from './tools';
import { flagChange, adminAudit, impressions, metricAlert } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listFeatureFlags,
    getFeatureFlag,
    createFeatureFlag,
    updateFeatureFlag,
    deleteFeatureFlag,
    listEnvironments,
    manageEnvironment,
    manageSegment,
    listSegments,
    listWorkspaces,
    manageFlagSet,
    manageUsers,
    manageGroups,
    listTrafficTypes
  ],
  triggers: [flagChange, adminAudit, impressions, metricAlert]
});
