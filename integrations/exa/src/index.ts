import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchTool,
  getContentsTool,
  findSimilarTool,
  answerTool,
  createResearchTool,
  getResearchTool,
  createWebsetTool,
  getWebsetTool,
  listWebsetsTool,
  updateWebsetTool,
  deleteWebsetTool,
  cancelWebsetTool,
  listWebsetItemsTool,
  getWebsetItemTool,
  deleteWebsetItemTool,
  createEnrichmentTool,
  updateEnrichmentTool,
  deleteEnrichmentTool,
  createMonitorTool,
  deleteMonitorTool,
  createExportTool,
  getExportTool
} from './tools';
import { websetEventsTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchTool,
    getContentsTool,
    findSimilarTool,
    answerTool,
    createResearchTool,
    getResearchTool,
    createWebsetTool,
    getWebsetTool,
    listWebsetsTool,
    updateWebsetTool,
    deleteWebsetTool,
    cancelWebsetTool,
    listWebsetItemsTool,
    getWebsetItemTool,
    deleteWebsetItemTool,
    createEnrichmentTool,
    updateEnrichmentTool,
    deleteEnrichmentTool,
    createMonitorTool,
    deleteMonitorTool,
    createExportTool,
    getExportTool
  ],
  triggers: [websetEventsTrigger]
});
