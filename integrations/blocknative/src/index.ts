import { Slate } from 'slates';
import { spec } from './spec';
import {
  estimateGasPrice,
  predictBaseFee,
  getGasDistribution,
  listSupportedChains,
  listGasOracles,
  decodeL2Batch,
  getBlob
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    estimateGasPrice,
    predictBaseFee,
    getGasDistribution,
    listSupportedChains,
    listGasOracles,
    decodeL2Batch,
    getBlob
  ],
  triggers: [inboundWebhook]
});
