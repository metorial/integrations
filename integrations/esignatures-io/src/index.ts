import { Slate } from 'slates';
import { spec } from './spec';
import {
  createContract,
  queryContract,
  withdrawContract,
  generatePdfPreview,
  manageSigners,
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  copyTemplate,
  deleteTemplate,
  manageCollaborators
} from './tools';
import { contractEvents, signerEvents, errorEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createContract,
    queryContract,
    withdrawContract,
    generatePdfPreview,
    manageSigners,
    listTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    copyTemplate,
    deleteTemplate,
    manageCollaborators
  ],
  triggers: [contractEvents, signerEvents, errorEvents]
});
