import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTransactions,
  getTransaction,
  listUsers,
  manageUser,
  listCards,
  manageCard,
  listBills,
  manageBill,
  listReimbursements,
  getReimbursement,
  manageDepartment,
  manageLimit,
  manageSpendProgram,
  getBusiness,
  listVendors,
  listEntities
} from './tools';
import {
  transactionEvents,
  billEvents,
  reimbursementEvents,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTransactions,
    getTransaction,
    listUsers,
    manageUser,
    listCards,
    manageCard,
    listBills,
    manageBill,
    listReimbursements,
    getReimbursement,
    manageDepartment,
    manageLimit,
    manageSpendProgram,
    getBusiness,
    listVendors,
    listEntities
  ],
  triggers: [inboundWebhook, transactionEvents, billEvents, reimbursementEvents]
});
