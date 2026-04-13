import { Slate } from 'slates';
import { spec } from './spec';
import {
  listAccounts,
  createDataSource,
  deleteDataSource,
  listDatasets,
  createDataset,
  deleteDataset,
  purgeDataset,
  ingestData,
  getIngestionStatus,
  listIngestions,
  listTimezones,
  validateKey
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listAccounts,
    createDataSource,
    deleteDataSource,
    listDatasets,
    createDataset,
    deleteDataset,
    purgeDataset,
    ingestData,
    getIngestionStatus,
    listIngestions,
    listTimezones,
    validateKey
  ],
  triggers: [inboundWebhook]
});
