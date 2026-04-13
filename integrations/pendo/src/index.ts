import { Slate } from 'slates';
import { spec } from './spec';
import {
  getVisitor,
  getAccount,
  updateVisitorMetadata,
  updateAccountMetadata,
  listGuides,
  getGuide,
  listSegments,
  createSegment,
  deleteSegment,
  runAggregation,
  listPages,
  listFeatures,
  bulkDelete,
  getReport,
  getMetadataSchema,
} from './tools';
import { pendoEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getVisitor,
    getAccount,
    updateVisitorMetadata,
    updateAccountMetadata,
    listGuides,
    getGuide,
    listSegments,
    createSegment,
    deleteSegment,
    runAggregation,
    listPages,
    listFeatures,
    bulkDelete,
    getReport,
    getMetadataSchema,
  ],
  triggers: [
    pendoEvents,
  ],
});
