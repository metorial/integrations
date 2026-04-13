import { Slate } from 'slates';
import { spec } from './spec';
import {
  uploadDocument,
  listDocuments,
  getDocument,
  getExtractedData,
  deleteDocument,
  updateReviewStatus,
  listDocumentTypes,
  getReviewUrl
} from './tools';
import { documentStatusChanged } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    uploadDocument,
    listDocuments,
    getDocument,
    getExtractedData,
    deleteDocument,
    updateReviewStatus,
    listDocumentTypes,
    getReviewUrl
  ],
  triggers: [documentStatusChanged]
});
