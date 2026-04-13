import { Slate } from 'slates';
import { spec } from './spec';
import {
  transcribeAudio,
  batchTranscribeAudio,
  getOperation,
  createRecognizer,
  getRecognizer,
  listRecognizers,
  updateRecognizer,
  deleteRecognizer,
  synthesizeSpeech,
  listVoices,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    transcribeAudio,
    batchTranscribeAudio,
    getOperation,
    createRecognizer,
    getRecognizer,
    listRecognizers,
    updateRecognizer,
    deleteRecognizer,
    synthesizeSpeech,
    listVoices,
  ],
  triggers: [
    inboundWebhook,
  ],
});
