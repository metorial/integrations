import { Slate } from 'slates';
import { spec } from './spec';
import {
  listPayments,
  getPayment,
  createPayment,
  managePayment,
  refundPayment,
  searchOrders,
  getOrder,
  createOrder,
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCatalog,
  getCatalogObject,
  upsertCatalogObject,
  deleteCatalogObject,
  getInventory,
  adjustInventory,
  listInvoices,
  getInvoice,
  createInvoice,
  manageInvoice,
  listLocations
} from './tools';
import {
  paymentEvents,
  orderEvents,
  customerEvents,
  invoiceEvents,
  catalogEvents,
  inventoryEvents,
  refundEvents,
  bookingEvents,
  disputeEvents,
  subscriptionEvents,
  loyaltyEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listPayments,
    getPayment,
    createPayment,
    managePayment,
    refundPayment,
    searchOrders,
    getOrder,
    createOrder,
    listCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCatalog,
    getCatalogObject,
    upsertCatalogObject,
    deleteCatalogObject,
    getInventory,
    adjustInventory,
    listInvoices,
    getInvoice,
    createInvoice,
    manageInvoice,
    listLocations
  ],
  triggers: [
    paymentEvents,
    orderEvents,
    customerEvents,
    invoiceEvents,
    catalogEvents,
    inventoryEvents,
    refundEvents,
    bookingEvents,
    disputeEvents,
    subscriptionEvents,
    loyaltyEvents
  ]
});
