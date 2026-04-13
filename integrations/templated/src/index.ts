import { Slate } from 'slates';
import { spec } from './spec';
import {
  createRender,
  listRenders,
  deleteRender,
  mergeRenders,
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  browseGallery,
  manageFolder,
  listFolders,
  listUploads,
  deleteUploads,
  listFonts,
  deleteFonts,
  getAccount
} from './tools';
import { editorEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createRender,
    listRenders,
    deleteRender,
    mergeRenders,
    listTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    browseGallery,
    manageFolder,
    listFolders,
    listUploads,
    deleteUploads,
    listFonts,
    deleteFonts,
    getAccount
  ],
  triggers: [editorEvent]
});
