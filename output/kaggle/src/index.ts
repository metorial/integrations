import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchCompetitions,
  getCompetitionDetails,
  searchDatasets,
  getDatasetDetails,
  createDataset,
  searchKernels,
  getKernelDetails,
  pushKernel,
  searchModels,
  getModelDetails,
  manageModel,
  manageModelVariation,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    searchCompetitions,
    getCompetitionDetails,
    searchDatasets,
    getDatasetDetails,
    createDataset,
    searchKernels,
    getKernelDetails,
    pushKernel,
    searchModels,
    getModelDetails,
    manageModel,
    manageModelVariation,
  ],
  triggers: [
    inboundWebhook,
  ],
});
