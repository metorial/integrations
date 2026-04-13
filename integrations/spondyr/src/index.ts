import {
  Slate } from 'slates';
import { spec } from './spec';
import { listTransactionTypes, createCorrespondence, getCorrespondenceStatus, deliverCorrespondence } from './tools';
import { correspondenceProcessed,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTransactionTypes,
    createCorrespondence,
    getCorrespondenceStatus,
    deliverCorrespondence,
  ],
  triggers: [
    inboundWebhook,
    correspondenceProcessed,
  ],
});
