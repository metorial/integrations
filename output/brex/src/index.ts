import { Slate } from 'slates';
import { spec } from './spec';
import {
  listUsers,
  manageUser,
  listCards,
  manageCard,
  listExpenses,
  updateExpense,
  listVendors,
  manageVendor,
  createTransfer,
  listTransfers,
  listBudgets,
  manageBudget,
  listTransactions,
  listAccounts,
  listDepartmentsLocations,
} from './tools';
import { brexEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listUsers,
    manageUser,
    listCards,
    manageCard,
    listExpenses,
    updateExpense,
    listVendors,
    manageVendor,
    createTransfer,
    listTransfers,
    listBudgets,
    manageBudget,
    listTransactions,
    listAccounts,
    listDepartmentsLocations,
  ],
  triggers: [
    brexEvents,
  ],
});
