import { Slate } from 'slates';
import { spec } from './spec';
import {
  querySearchAnalytics,
  listSites,
  manageSite,
  manageSitemap,
  inspectUrl,
  runMobileFriendlyTest
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    querySearchAnalytics,
    listSites,
    manageSite,
    manageSitemap,
    inspectUrl,
    runMobileFriendlyTest
  ],
  triggers: [inboundWebhook]
});
