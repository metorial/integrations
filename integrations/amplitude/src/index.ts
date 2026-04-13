import { Slate } from 'slates';
import { spec } from './spec';
import {
  trackEventsTool,
  identifyUserTool,
  queryActiveUsersTool,
  queryEventSegmentationTool,
  queryFunnelTool,
  queryRetentionTool,
  querySessionsTool,
  queryUserCompositionTool,
  getUserProfileTool,
  getChartResultsTool,
  manageCohortsTool,
  manageTaxonomyTool,
  manageAnnotationsTool,
  deleteUserDataTool
} from './tools';
import { eventWebhookTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    trackEventsTool,
    identifyUserTool,
    queryActiveUsersTool,
    queryEventSegmentationTool,
    queryFunnelTool,
    queryRetentionTool,
    querySessionsTool,
    queryUserCompositionTool,
    getUserProfileTool,
    getChartResultsTool,
    manageCohortsTool,
    manageTaxonomyTool,
    manageAnnotationsTool,
    deleteUserDataTool
  ],
  triggers: [
    eventWebhookTrigger
  ]
});
