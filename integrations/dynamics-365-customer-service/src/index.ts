import { Slate } from 'slates';
import { spec } from './spec';
import {
  createCustomerServiceRecord,
  downloadNoteAttachment,
  getCustomerServiceRecord,
  listCustomerServiceRecords,
  manageCaseWorkflow,
  updateCustomerServiceRecord
} from './tools';

export let provider = Slate.create({
  spec,
  tools: [
    listCustomerServiceRecords,
    getCustomerServiceRecord,
    createCustomerServiceRecord,
    updateCustomerServiceRecord,
    manageCaseWorkflow,
    downloadNoteAttachment
  ],
  triggers: []
});
