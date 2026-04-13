import { Slate } from 'slates';
import { spec } from './spec';
import {
  getReport,
  listReports,
  manageReport,
  manageQuery,
  runReport,
  getReportRun,
  listReportRuns,
  listCollections,
  manageCollection,
  listDatasets,
  manageDataset,
  listDataSources,
  listReportSchedules,
  manageReportSchedule,
  listDefinitions,
  manageDefinition,
  listMembers,
} from './tools';
import {
  reportEvents,
  reportRunEvents,
  dataSourceEvents,
  definitionEvents,
  memberEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getReport,
    listReports,
    manageReport,
    manageQuery,
    runReport,
    getReportRun,
    listReportRuns,
    listCollections,
    manageCollection,
    listDatasets,
    manageDataset,
    listDataSources,
    listReportSchedules,
    manageReportSchedule,
    listDefinitions,
    manageDefinition,
    listMembers,
  ],
  triggers: [
    reportEvents,
    reportRunEvents,
    dataSourceEvents,
    definitionEvents,
    memberEvents,
  ],
});
