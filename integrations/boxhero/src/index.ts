import { Slate } from 'slates';
import { spec } from './spec';
import {
  listItems,
  listTransactions,
  createTransaction,
  listLocations,
  listPartners,
  listAttributes,
  getTeam
} from './tools';
import { transactionEvents, itemEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listItems,
    listTransactions,
    createTransaction,
    listLocations,
    listPartners,
    listAttributes,
    getTeam
  ],
  triggers: [transactionEvents, itemEvents]
});
