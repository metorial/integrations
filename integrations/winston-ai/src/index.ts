import { Slate } from 'slates';
import { spec } from './spec';
import {
  detectAiText,
  detectAiImage,
  detectPlagiarism,
  factCheck,
  compareTexts
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    detectAiText.build(),
    detectAiImage.build(),
    detectPlagiarism.build(),
    factCheck.build(),
    compareTexts.build()
  ],
  triggers: [inboundWebhook]
});
