import { Slate } from 'slates';
import { spec } from './spec';
import {
  getTokenBalances,
  getTransfers,
  getNFTs,
  getTokenPrices,
  simulateTransaction,
  getBlockInfo,
  getTransaction,
  getWalletBalance,
  getNFTOwners,
  getLogs,
  sendRawTransaction,
  callContract,
} from './tools';
import {
  addressActivity,
  nftActivity,
  customWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getTokenBalances,
    getTransfers,
    getNFTs,
    getTokenPrices,
    simulateTransaction,
    getBlockInfo,
    getTransaction,
    getWalletBalance,
    getNFTOwners,
    getLogs,
    sendRawTransaction,
    callContract,
  ],
  triggers: [
    addressActivity,
    nftActivity,
    customWebhook,
  ],
});
