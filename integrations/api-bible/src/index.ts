import { Slate } from 'slates';
import { spec } from './spec';
import {
  listBibles,
  getBible,
  getBooks,
  getChapter,
  getVerse,
  getPassage,
  searchBible,
  getSections,
  listAudioBibles,
  getAudioChapter,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listBibles,
    getBible,
    getBooks,
    getChapter,
    getVerse,
    getPassage,
    searchBible,
    getSections,
    listAudioBibles,
    getAudioChapter,
  ],
  triggers: [
    inboundWebhook,
  ],
});
