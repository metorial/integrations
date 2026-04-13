import { Slate } from 'slates';
import { spec } from './spec';
import {
  recordEvents,
  runQuery,
  funnelAnalysis,
  extractEvents,
  manageSavedQueries,
  manageAccessKeys,
  manageCachedDatasets,
  inspectSchema,
  deleteEvents,
  getProjectInfo
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    recordEvents,
    runQuery,
    funnelAnalysis,
    extractEvents,
    manageSavedQueries,
    manageAccessKeys,
    manageCachedDatasets,
    inspectSchema,
    deleteEvents,
    getProjectInfo
  ] as any,
  triggers: [inboundWebhook]
});
