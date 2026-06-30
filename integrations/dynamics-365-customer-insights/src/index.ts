import { Slate } from 'slates';
import { spec } from './spec';
import {
  exportSegmentMembers,
  getCustomerInsightsRecord,
  listCustomerInsightsRecords,
  listCustomerInsightsTables
} from './tools';

export let provider = Slate.create({
  spec,
  tools: [
    listCustomerInsightsTables,
    listCustomerInsightsRecords,
    getCustomerInsightsRecord,
    exportSegmentMembers
  ],
  triggers: []
});
