import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  generatePass,
  listPasses,
  getPass,
  updatePass,
  deletePass,
  emailPass,
  listPassTypes,
  manageScanner,
  listScanners,
} from './tools';
import {
  passEvents,
  registrationEvents,
  scanEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    generatePass,
    listPasses,
    getPass,
    updatePass,
    deletePass,
    emailPass,
    listPassTypes,
    manageScanner,
    listScanners,
  ],
  triggers: [
    passEvents,
    registrationEvents,
    scanEvents,
  ],
});
