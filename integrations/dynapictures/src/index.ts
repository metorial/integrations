import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateImage,
  generateBatchPdf,
  listTemplates,
  getTemplate,
  deleteImage,
  listWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  listMediaAssets,
  getMediaAsset,
  deleteMediaAsset
} from './tools';
import { newImageGenerated } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    generateImage,
    generateBatchPdf,
    listTemplates,
    getTemplate,
    deleteImage,
    listWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    listMediaAssets,
    getMediaAsset,
    deleteMediaAsset
  ],
  triggers: [newImageGenerated]
});
