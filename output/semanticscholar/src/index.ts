import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchPapers,
  getPaper,
  getCitations,
  searchAuthors,
  getAuthor,
  getAuthorPapers,
  recommendPapers,
  autocompletePapers,
  getDatasets,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    searchPapers,
    getPaper,
    getCitations,
    searchAuthors,
    getAuthor,
    getAuthorPapers,
    recommendPapers,
    autocompletePapers,
    getDatasets,
  ],
  triggers: [
    inboundWebhook,
  ],
});
