import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTests,
  getTest,
  runTest,
  getTestRun,
  listTestRuns,
  stopTestRun,
  listSuites,
  getSuite,
  runSuite,
  getSuiteRun,
  listSuiteRuns,
  stopSuiteRun,
  listProfiles
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listTests,
    getTest,
    runTest,
    getTestRun,
    listTestRuns,
    stopTestRun,
    listSuites,
    getSuite,
    runSuite,
    getSuiteRun,
    listSuiteRuns,
    stopSuiteRun,
    listProfiles
  ],
  triggers: [inboundWebhook]
});
