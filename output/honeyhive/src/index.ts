import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
} from './tools/manage-projects';
import {
  startSession,
  getSession,
  deleteSession,
} from './tools/manage-sessions';
import {
  logEvent,
  updateEvent,
  logEventBatch,
  queryEvents,
  getEvent,
  deleteEvent,
} from './tools/manage-events';
import {
  listDatasets,
  createDataset,
  updateDataset,
  deleteDataset,
  addDatapointsToDataset,
} from './tools/manage-datasets';
import {
  listConfigurations,
  createConfiguration,
  updateConfiguration,
  deleteConfiguration,
} from './tools/manage-configurations';
import {
  listMetrics,
  createMetric,
  updateMetric,
  deleteMetric,
} from './tools/manage-metrics';
import {
  listRuns,
  createRun,
  getRun,
  getRunResult,
  compareRuns,
  deleteRun,
} from './tools/manage-runs';
import { postFeedback } from './tools/post-feedback';
import { newEvents } from './triggers/new-events';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listProjects,
    createProject,
    updateProject,
    deleteProject,
    startSession,
    getSession,
    deleteSession,
    logEvent,
    updateEvent,
    logEventBatch,
    queryEvents,
    getEvent,
    deleteEvent,
    listDatasets,
    createDataset,
    updateDataset,
    deleteDataset,
    addDatapointsToDataset,
    listConfigurations,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    listMetrics,
    createMetric,
    updateMetric,
    deleteMetric,
    listRuns,
    createRun,
    getRun,
    getRunResult,
    compareRuns,
    deleteRun,
    postFeedback,
  ],
  triggers: [
    inboundWebhook,
    newEvents,
  ],
});
