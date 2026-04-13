import {
  Slate } from 'slates';
import { spec } from './spec';
import { queryAnalytics, manageGroups, manageGroupItems, manageReportingJobs, listBulkReports, listReportTypes, downloadBulkReport } from './tools';
import { newBulkReports,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [queryAnalytics, manageGroups, manageGroupItems, manageReportingJobs, listBulkReports, listReportTypes, downloadBulkReport],
  triggers: [
    inboundWebhook,newBulkReports],
});
