import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  searchInvoices,
  getInvoice,
  createInvoice,
  searchSuppliers,
  createSupplier,
  updateSupplier,
  searchRequisitions,
  createRequisition,
  searchExpenseReports,
  createExpenseReport,
  searchContracts,
  createContract,
  searchApprovals,
  processApproval,
  searchUsers,
  createUser,
  updateUser,
  searchAccounts,
  createAccount,
  searchReceipts,
  createReceipt
} from './tools';
import {
  purchaseOrderChanges,
  invoiceChanges,
  requisitionChanges,
  expenseReportChanges,
  supplierChanges,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchPurchaseOrders,
    getPurchaseOrder,
    createPurchaseOrder,
    updatePurchaseOrder,
    searchInvoices,
    getInvoice,
    createInvoice,
    searchSuppliers,
    createSupplier,
    updateSupplier,
    searchRequisitions,
    createRequisition,
    searchExpenseReports,
    createExpenseReport,
    searchContracts,
    createContract,
    searchApprovals,
    processApproval,
    searchUsers,
    createUser,
    updateUser,
    searchAccounts,
    createAccount,
    searchReceipts,
    createReceipt
  ],
  triggers: [
    inboundWebhook,
    purchaseOrderChanges,
    invoiceChanges,
    requisitionChanges,
    expenseReportChanges,
    supplierChanges
  ]
});
