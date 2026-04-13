import { Slate } from 'slates';
import { spec } from './spec';
import {
  listFeatureFlags,
  getFeatureFlag,
  createFeatureFlag,
  updateFeatureFlag,
  toggleFeatureFlag,
  deleteFeatureFlag,
  listProjects,
  manageProject,
  listEnvironments,
  manageEnvironment,
  listSegments,
  manageSegment,
  queryAuditLog,
  listMembers,
  inviteMembers,
  searchContexts,
  listMetrics,
  listExperiments,
} from './tools';
import {
  resourceChangeTrigger,
  flagChangeTrigger,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listFeatureFlags,
    getFeatureFlag,
    createFeatureFlag,
    updateFeatureFlag,
    toggleFeatureFlag,
    deleteFeatureFlag,
    listProjects,
    manageProject,
    listEnvironments,
    manageEnvironment,
    listSegments,
    manageSegment,
    queryAuditLog,
    listMembers,
    inviteMembers,
    searchContexts,
    listMetrics,
    listExperiments,
  ],
  triggers: [
    resourceChangeTrigger,
    flagChangeTrigger,
  ],
});
