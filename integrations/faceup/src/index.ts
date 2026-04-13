import { Slate } from 'slates';
import { spec } from './spec';
import { getReportStatistics, listReports, getReport } from './tools';
import { newReport, newMessage, newInternalComment } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [getReportStatistics, listReports, getReport],
  triggers: [newReport, newMessage, newInternalComment]
});
