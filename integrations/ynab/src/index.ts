import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listBudgets,
  getBudget,
  listAccounts,
  createAccount,
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  importTransactions,
  listScheduledTransactions,
  manageScheduledTransaction,
  listCategories,
  manageCategory,
  manageCategoryGroup,
  listPayees,
  updatePayee,
  listMonths,
  getMonth,
} from './tools';
import {
  transactionChanges,
  accountChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listBudgets,
    getBudget,
    listAccounts,
    createAccount,
    listTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactions,
    listScheduledTransactions,
    manageScheduledTransaction,
    listCategories,
    manageCategory,
    manageCategoryGroup,
    listPayees,
    updatePayee,
    listMonths,
    getMonth,
  ],
  triggers: [
    inboundWebhook,
    transactionChanges,
    accountChanges,
  ],
});
