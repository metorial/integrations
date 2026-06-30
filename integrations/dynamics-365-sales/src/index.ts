import { Slate } from 'slates';
import { spec } from './spec';
import {
  closeOpportunity,
  createSalesRecord,
  deleteSalesRecord,
  getSalesRecord,
  listSalesRecords,
  qualifyLead,
  updateSalesRecord
} from './tools';

export let provider = Slate.create({
  spec,
  tools: [
    listSalesRecords,
    getSalesRecord,
    createSalesRecord,
    updateSalesRecord,
    deleteSalesRecord,
    qualifyLead,
    closeOpportunity
  ],
  triggers: []
});
