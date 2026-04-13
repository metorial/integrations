import { Slate } from 'slates';
import { spec } from './spec';
import {
  queryTable,
  getTimeSeries,
  searchDatasets,
  getTableMetadata,
  getDatasetInfo,
  listDatabases,
  exportTable,
  getLastSale,
  getBars,
  getSnapshot,
  getOptionsChain
} from './tools';
import { datasetUpdated, tableDataChanged, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    queryTable,
    getTimeSeries,
    searchDatasets,
    getTableMetadata,
    getDatasetInfo,
    listDatabases,
    exportTable,
    getLastSale,
    getBars,
    getSnapshot,
    getOptionsChain
  ],
  triggers: [inboundWebhook, datasetUpdated, tableDataChanged]
});
