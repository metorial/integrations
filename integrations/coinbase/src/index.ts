import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageAccounts,
  sendCrypto,
  listTransactions,
  buySellCrypto,
  depositWithdraw,
  manageOrders,
  listProducts,
  getCandles,
  getPrices,
  getExchangeRates,
  getUserProfile,
  manageAddresses,
  manageCommerceCharges
} from './tools';
import { accountNotifications, commerceChargeEvents, transactionPolling } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageAccounts,
    sendCrypto,
    listTransactions,
    buySellCrypto,
    depositWithdraw,
    manageOrders,
    listProducts,
    getCandles,
    getPrices,
    getExchangeRates,
    getUserProfile,
    manageAddresses,
    manageCommerceCharges
  ],
  triggers: [accountNotifications, commerceChargeEvents, transactionPolling]
});
