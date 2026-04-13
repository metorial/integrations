import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchModels,
  getModel,
  updateModel,
  listTags,
  createTag,
  updateTag,
  deleteTag,
  getAssets,
  purchaseAssetBundle,
  getSweeps,
  getDimensions,
  getNotes,
} from './tools';
import { modelEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchModels,
    getModel,
    updateModel,
    listTags,
    createTag,
    updateTag,
    deleteTag,
    getAssets,
    purchaseAssetBundle,
    getSweeps,
    getDimensions,
    getNotes,
  ],
  triggers: [
    modelEvents,
  ],
});
