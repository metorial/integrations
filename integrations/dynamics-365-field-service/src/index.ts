import { Slate } from 'slates';
import { spec } from './spec';
import {
  createFieldServiceRecord,
  getFieldServiceRecord,
  listFieldServiceRecords,
  manageWorkOrderLifecycle,
  scheduleBooking,
  updateBooking,
  updateFieldServiceRecord
} from './tools';

export let provider = Slate.create({
  spec,
  tools: [
    listFieldServiceRecords,
    getFieldServiceRecord,
    createFieldServiceRecord,
    updateFieldServiceRecord,
    scheduleBooking,
    updateBooking,
    manageWorkOrderLifecycle
  ],
  triggers: []
});
