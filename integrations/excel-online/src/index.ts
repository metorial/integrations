import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  findWorkbooks,
  manageWorksheets,
  readRange,
  writeRange,
  manageTables,
  manageTableRows,
  manageTableColumns,
  sortFilterTable,
  manageCharts,
  manageNamedItems,
  invokeFunction,
  manageSessions,
} from './tools';
import { workbookChanged,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    findWorkbooks,
    manageWorksheets,
    readRange,
    writeRange,
    manageTables,
    manageTableRows,
    manageTableColumns,
    sortFilterTable,
    manageCharts,
    manageNamedItems,
    invokeFunction,
    manageSessions,
  ],
  triggers: [
    inboundWebhook,
    workbookChanged,
  ],
});
