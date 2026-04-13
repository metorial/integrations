import { Slate } from 'slates';
import { spec } from './spec';
import {
  createComparison,
  getComparison,
  listComparisons,
  deleteComparison,
  getViewerUrl,
  exportComparison,
  getExportStatus,
  getChangeDetails
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    createComparison,
    getComparison,
    listComparisons,
    deleteComparison,
    getViewerUrl,
    exportComparison,
    getExportStatus,
    getChangeDetails
  ],
  triggers: [inboundWebhook]
});
