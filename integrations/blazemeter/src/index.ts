import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listTests,
  getTest,
  manageTest,
  runTest,
  getTestResults,
  manageProject,
  listWorkspaces,
  manageVirtualService,
  manageMockTransaction,
  manageMonitoringTest,
  runMonitoringTest,
  manageBucket,
  manageSchedule,
  manageMonitoringEnvironment,
  manageWorkspaceUsers,
} from './tools';
import {
  testRunCompleted,
  monitoringTestRun,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTests,
    getTest,
    manageTest,
    runTest,
    getTestResults,
    manageProject,
    listWorkspaces,
    manageVirtualService,
    manageMockTransaction,
    manageMonitoringTest,
    runMonitoringTest,
    manageBucket,
    manageSchedule,
    manageMonitoringEnvironment,
    manageWorkspaceUsers,
  ],
  triggers: [
    inboundWebhook,
    testRunCompleted,
    monitoringTestRun,
  ],
});
