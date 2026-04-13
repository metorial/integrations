import { Slate } from 'slates';
import { spec } from './spec';
import {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  addComment,
  lockRecord,
  executeActionButton,
  listActionButtons,
  exportRecord,
  getFileUrl,
} from './tools';
import { recordChanges } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    addComment,
    lockRecord,
    executeActionButton,
    listActionButtons,
    exportRecord,
    getFileUrl,
  ],
  triggers: [
    recordChanges,
  ],
});
