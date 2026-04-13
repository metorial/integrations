import { Slate } from 'slates';
import { spec } from './spec';
import {
  listDesigns,
  getDesignFormat,
  generateImage,
  generateMultiFormat,
  getGenerationStatus,
  createDynamicImage,
  exportBanners,
  listProjects,
  createProject,
  listFonts,
  duplicateWorkspaceTemplate,
  getDuplicationStatus,
} from './tools';
import {
  bannerGenerated,
  batchGenerationCompleted,
  exportCompleted,
  designStatusUpdated,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listDesigns,
    getDesignFormat,
    generateImage,
    generateMultiFormat,
    getGenerationStatus,
    createDynamicImage,
    exportBanners,
    listProjects,
    createProject,
    listFonts,
    duplicateWorkspaceTemplate,
    getDuplicationStatus,
  ],
  triggers: [
    bannerGenerated,
    batchGenerationCompleted,
    exportCompleted,
    designStatusUpdated,
  ],
});
