import { Slate } from 'slates';
import { spec } from './spec';
import {
  listSources,
  getSource,
  createSource,
  updateSource,
  listAssets,
  getAsset,
  updateAsset,
  refreshAsset,
  purgeCache,
  getReports,
  generateSignedUrl,
  buildRenderUrl
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listSources,
    getSource,
    createSource,
    updateSource,
    listAssets,
    getAsset,
    updateAsset,
    refreshAsset,
    purgeCache,
    getReports,
    generateSignedUrl,
    buildRenderUrl
  ],
  triggers: [inboundWebhook]
});
