import { Slate } from 'slates';
import { spec } from './spec';
import {
  getDocument,
  listDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  submitDocument,
  cancelDocument,
  amendDocument,
  callMethod,
  getReport,
  countDocuments
} from './tools';
import { documentEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getDocument,
    listDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    submitDocument,
    cancelDocument,
    amendDocument,
    callMethod,
    getReport,
    countDocuments
  ],
  triggers: [
    documentEvent
  ]
});
