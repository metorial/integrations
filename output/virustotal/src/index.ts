import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  scanFile,
  scanUrl,
  getFileReport,
  getUrlReport,
  getDomainReport,
  getIpReport,
  getAnalysisStatus,
  addComment,
  getComments,
  addVote,
  getRelationships,
  searchIntelligence,
  manageLivehuntRuleset,
  manageRetrohunt
} from './tools';
import { iocStream,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    scanFile,
    scanUrl,
    getFileReport,
    getUrlReport,
    getDomainReport,
    getIpReport,
    getAnalysisStatus,
    addComment,
    getComments,
    addVote,
    getRelationships,
    searchIntelligence,
    manageLivehuntRuleset,
    manageRetrohunt
  ],
  triggers: [
    inboundWebhook,
    iocStream
  ]
});
