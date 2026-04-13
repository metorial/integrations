import { Slate } from 'slates';
import { spec } from './spec';
import {
  listSources,
  getSource,
  createSource,
  updateSource,
  listDestinations,
  getDestination,
  createDestination,
  updateDestination,
  listModels,
  getModel,
  createModel,
  updateModel,
  listSyncs,
  getSync,
  createSync,
  updateSync,
  triggerSync,
  triggerSyncSequence,
  listSyncRuns,
  getSyncSequenceRun
} from './tools';
import { syncRunCompleted, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listSources,
    getSource,
    createSource,
    updateSource,
    listDestinations,
    getDestination,
    createDestination,
    updateDestination,
    listModels,
    getModel,
    createModel,
    updateModel,
    listSyncs,
    getSync,
    createSync,
    updateSync,
    triggerSync,
    triggerSyncSequence,
    listSyncRuns,
    getSyncSequenceRun
  ],
  triggers: [inboundWebhook, syncRunCompleted]
});
