import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listForms,
  getFormResults,
  getResultDetails,
  addResult,
  updateResult,
  removeResult,
  markResultProcessed,
  exportResults,
  getResultPdf,
  getFile,
  getFormFilters,
  listVisitors,
  addVisitor,
  updateVisitor,
  removeVisitor,
  getVisitorResults,
  authenticateVisitor,
  signOn,
  parkData,
} from './tools';
import { newFormSubmission,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listForms,
    getFormResults,
    getResultDetails,
    addResult,
    updateResult,
    removeResult,
    markResultProcessed,
    exportResults,
    getResultPdf,
    getFile,
    getFormFilters,
    listVisitors,
    addVisitor,
    updateVisitor,
    removeVisitor,
    getVisitorResults,
    authenticateVisitor,
    signOn,
    parkData,
  ],
  triggers: [
    inboundWebhook,
    newFormSubmission,
  ],
});
