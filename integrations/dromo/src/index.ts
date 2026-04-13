import { Slate } from 'slates';
import { spec } from './spec';
import {
  listUploads,
  getUpload,
  deleteUpload,
  listSchemas,
  getSchema,
  createSchema,
  updateSchema,
  deleteSchema,
  createHeadlessImport,
  getHeadlessImport,
  listHeadlessImports,
  deleteHeadlessImport,
} from './tools';
import { importEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listUploads,
    getUpload,
    deleteUpload,
    listSchemas,
    getSchema,
    createSchema,
    updateSchema,
    deleteSchema,
    createHeadlessImport,
    getHeadlessImport,
    listHeadlessImports,
    deleteHeadlessImport,
  ],
  triggers: [
    importEvents,
  ],
});
