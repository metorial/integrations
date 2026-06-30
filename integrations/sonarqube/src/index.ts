import { Slate } from 'slates';
import { spec } from './spec';
import {
  getComponentTool,
  getComputeTaskTool,
  getIssueChangelogTool,
  getProjectAnalysisStatusTool,
  getProjectMeasuresTool,
  getQualityGateStatusTool,
  listComponentTreeTool,
  listMetricsTool,
  listProjectBranchesTool,
  listProjectPullRequestsTool,
  searchIssuesTool,
  searchMeasureHistoryTool,
  searchProjectsTool
} from './tools';

export let provider = Slate.create({
  spec,
  tools: [
    searchProjectsTool,
    getComponentTool,
    listComponentTreeTool,
    listProjectBranchesTool,
    listProjectPullRequestsTool,
    getComputeTaskTool,
    getProjectAnalysisStatusTool,
    listMetricsTool,
    getProjectMeasuresTool,
    searchMeasureHistoryTool,
    getQualityGateStatusTool,
    searchIssuesTool,
    getIssueChangelogTool
  ],
  triggers: []
});
