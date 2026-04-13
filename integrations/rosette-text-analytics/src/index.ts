import { Slate } from 'slates';
import { spec } from './spec';
import {
  detectLanguageTool,
  extractEntitiesTool,
  analyzeSentimentTool,
  categorizeTextTool,
  extractTopicsTool,
  extractRelationshipsTool,
  compareNamesTool,
  translateNameTool,
  deduplicateNamesTool,
  analyzeMorphologyTool,
  tokenizeTextTool,
  splitSentencesTool,
  getSyntaxDependenciesTool,
  transliterateTextTool,
  getTextEmbeddingTool,
  compareAddressesTool,
  compareRecordsTool,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    detectLanguageTool,
    extractEntitiesTool,
    analyzeSentimentTool,
    categorizeTextTool,
    extractTopicsTool,
    extractRelationshipsTool,
    compareNamesTool,
    translateNameTool,
    deduplicateNamesTool,
    analyzeMorphologyTool,
    tokenizeTextTool,
    splitSentencesTool,
    getSyntaxDependenciesTool,
    transliterateTextTool,
    getTextEmbeddingTool,
    compareAddressesTool,
    compareRecordsTool,
  ],
  triggers: [
    inboundWebhook,
  ],
});
