import { Slate } from 'slates';
import { spec } from './spec';
import {
  uploadTemplate,
  listTemplates,
  updateTemplate,
  deleteTemplate,
  renderDocument,
  checkStatus,
  listCategoriesAndTags,
} from './tools';
import { renderCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    uploadTemplate,
    listTemplates,
    updateTemplate,
    deleteTemplate,
    renderDocument,
    checkStatus,
    listCategoriesAndTags,
  ],
  triggers: [
    renderCompleted,
  ],
});
