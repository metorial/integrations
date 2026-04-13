import { Slate } from 'slates';
import { spec } from './spec';
import {
  listContentItems,
  getContentItem,
  createContentItem,
  deleteContentItem,
  upsertLanguageVariant,
  manageWorkflow,
  listContentTypes,
  getContentType,
  listAssets,
  getAsset,
  updateAsset,
  deleteAsset,
  listTaxonomyGroups,
  listWorkflows,
  listLanguages,
  listCollections,
} from './tools';
import {
  contentItemEvents,
  assetEvents,
  contentTypeEvents,
  taxonomyEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listContentItems,
    getContentItem,
    createContentItem,
    deleteContentItem,
    upsertLanguageVariant,
    manageWorkflow,
    listContentTypes,
    getContentType,
    listAssets,
    getAsset,
    updateAsset,
    deleteAsset,
    listTaxonomyGroups,
    listWorkflows,
    listLanguages,
    listCollections,
  ],
  triggers: [
    contentItemEvents,
    assetEvents,
    contentTypeEvents,
    taxonomyEvents,
  ],
});
