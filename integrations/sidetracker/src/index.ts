import { Slate } from 'slates';
import { spec } from './spec';
import {
  getLists,
  getListRows,
  manageListRow,
  getSession,
  getSessions,
  updateSessionMetadata,
  addRevenue,
  updateSalesStatus,
  executeTrigger,
  addSessionNote
} from './tools';
import { listRowCreated, listRowUpdated } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getLists,
    getListRows,
    manageListRow,
    getSession,
    getSessions,
    updateSessionMetadata,
    addRevenue,
    updateSalesStatus,
    executeTrigger,
    addSessionNote
  ],
  triggers: [listRowCreated, listRowUpdated]
});
