import { Slate } from 'slates';
import { spec } from './spec';
import { listExtractors, listFolders, uploadDocument, getExtractedData } from './tools';
import { documentProcessed, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listExtractors, listFolders, uploadDocument, getExtractedData],
  triggers: [inboundWebhook, documentProcessed]
});
