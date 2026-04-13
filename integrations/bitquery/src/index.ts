import { Slate } from 'slates';
import { spec } from './spec';
import {
  executeQuery,
  getDexTrades,
  getTokenTransfers,
  getTokenBalance,
  getTokenPrice,
  getSmartContractEvents,
  getTransactions,
  getTokenHolders
} from './tools';
import { newDexTrades, newTokenTransfers, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    executeQuery,
    getDexTrades,
    getTokenTransfers,
    getTokenBalance,
    getTokenPrice,
    getSmartContractEvents,
    getTransactions,
    getTokenHolders
  ],
  triggers: [inboundWebhook, newDexTrades, newTokenTransfers]
});
