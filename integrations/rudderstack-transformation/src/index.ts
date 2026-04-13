import { Slate } from 'slates';
import { spec } from './spec';
import {
  createTransformation,
  getTransformation,
  listTransformations,
  updateTransformation,
  deleteTransformation,
  listTransformationVersions,
  createLibrary,
  getLibrary,
  listLibraries,
  updateLibrary,
  deleteLibrary,
  listLibraryVersions,
  publish
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    createTransformation,
    getTransformation,
    listTransformations,
    updateTransformation,
    deleteTransformation,
    listTransformationVersions,
    createLibrary,
    getLibrary,
    listLibraries,
    updateLibrary,
    deleteLibrary,
    listLibraryVersions,
    publish
  ],
  triggers: [inboundWebhook]
});
