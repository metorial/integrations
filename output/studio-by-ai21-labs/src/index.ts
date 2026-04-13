import { Slate } from 'slates';
import { spec } from './spec';
import {
  chatCompletion,
  maestroRun,
  conversationalRag,
  listFiles,
  getFile,
  updateFile,
  deleteFile,
  summarize,
  summarizeBySegment,
  paraphrase,
  textImprovements,
  grammarCheck,
  segmentText,
  contextualAnswer,
  textCompletion,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    chatCompletion,
    maestroRun,
    conversationalRag,
    listFiles,
    getFile,
    updateFile,
    deleteFile,
    summarize,
    summarizeBySegment,
    paraphrase,
    textImprovements,
    grammarCheck,
    segmentText,
    contextualAnswer,
    textCompletion,
  ],
  triggers: [
    inboundWebhook,
  ],
});
