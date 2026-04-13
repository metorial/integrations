import { Slate } from 'slates';
import { spec } from './spec';
import {
  runTest,
  getReport,
  listPages,
  getPage,
  retest,
  deleteResource,
  listLocationsBrowsers,
  getAccountStatus
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    runTest,
    getReport,
    listPages,
    getPage,
    retest,
    deleteResource,
    listLocationsBrowsers,
    getAccountStatus
  ],
  triggers: [inboundWebhook]
});
