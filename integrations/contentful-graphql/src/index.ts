import { Slate } from 'slates';
import { spec } from './spec';
import { queryContent, previewContent, introspectSchema, listContentTypes } from './tools';
import { entryEvents, assetEvents, contentTypeEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [queryContent, previewContent, introspectSchema, listContentTypes],
  triggers: [entryEvents, assetEvents, contentTypeEvents]
});
