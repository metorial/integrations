import { Slate } from 'slates';
import { spec } from './spec';
import {
  exportSegmentMembers,
  getCustomerInsightsRecord,
  listCustomerInsightsRecords
} from './tools';

export let provider = Slate.create({
  spec,
  tools: [listCustomerInsightsRecords, getCustomerInsightsRecord, exportSegmentMembers],
  triggers: []
});
