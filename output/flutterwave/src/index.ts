import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTransactions,
  verifyTransaction,
  createTransfer,
  listTransfers,
  getTransferRate,
  getTransactionFee,
  managePaymentPlans,
  manageSubscriptions,
  createVirtualAccount,
  payBill,
  listBillCategories,
  createRefund,
  listRefunds,
  listSettlements,
  resolveBankAccount,
  manageBeneficiaries,
} from './tools';
import {
  chargeCompleted,
  transferCompleted,
  subscriptionEvent,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTransactions,
    verifyTransaction,
    createTransfer,
    listTransfers,
    getTransferRate,
    getTransactionFee,
    managePaymentPlans,
    manageSubscriptions,
    createVirtualAccount,
    payBill,
    listBillCategories,
    createRefund,
    listRefunds,
    listSettlements,
    resolveBankAccount,
    manageBeneficiaries,
  ],
  triggers: [
    chargeCompleted,
    transferCompleted,
    subscriptionEvent,
  ],
});
