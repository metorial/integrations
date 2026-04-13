import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateSpeech,
  listVoices,
  getVoice,
  updateVoice,
  deleteVoice,
  getAccount
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [generateSpeech, listVoices, getVoice, updateVoice, deleteVoice, getAccount],
  triggers: [inboundWebhook]
});
