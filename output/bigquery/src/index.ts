import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  executeQuery,
  listDatasets,
  getDataset,
  createDataset,
  updateDataset,
  deleteDataset,
  listTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  loadData,
  exportData,
  listJobs,
  getJob,
  cancelJob,
  readTableData,
  insertRows,
  copyTable,
  listRoutines,
  getRoutine,
  createRoutine,
  deleteRoutine
} from './tools';
import {
  jobCompleted,
  datasetUpdated,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    executeQuery,
    listDatasets,
    getDataset,
    createDataset,
    updateDataset,
    deleteDataset,
    listTables,
    getTable,
    createTable,
    updateTable,
    deleteTable,
    loadData,
    exportData,
    listJobs,
    getJob,
    cancelJob,
    readTableData,
    insertRows,
    copyTable,
    listRoutines,
    getRoutine,
    createRoutine,
    deleteRoutine
  ],
  triggers: [
    inboundWebhook,
    jobCompleted,
    datasetUpdated
  ]
});
