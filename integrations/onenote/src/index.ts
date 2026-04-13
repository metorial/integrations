import { Slate } from 'slates';
import { spec } from './spec';
import {
  listNotebooks,
  getNotebook,
  createNotebook,
  listSections,
  createSection,
  listSectionGroups,
  createSectionGroup,
  listPages,
  getPage,
  createPage,
  updatePageContent,
  deletePage,
  searchPages,
  copyContent,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listNotebooks,
    getNotebook,
    createNotebook,
    listSections,
    createSection,
    listSectionGroups,
    createSectionGroup,
    listPages,
    getPage,
    createPage,
    updatePageContent,
    deletePage,
    searchPages,
    copyContent,
  ],
  triggers: [
    inboundWebhook,
  ],
});
