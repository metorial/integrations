import { Slate } from 'slates';
import { spec } from './spec';
import {
  createAddress,
  validateAddress,
  listAddresses,
  createShipment,
  getShipment,
  getRates,
  purchaseLabel,
  getTransaction,
  listTransactions,
  trackShipment,
  registerTracking,
  createCustomsDeclaration,
  createOrder,
  listOrders,
  listCarrierAccounts,
  createManifest,
  schedulePickup,
  createRefund,
  createParcelTemplate,
  listParcelTemplates,
  createBatch,
  purchaseBatch
} from './tools';
import { trackingUpdated, transactionEvents, batchEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createAddress,
    validateAddress,
    listAddresses,
    createShipment,
    getShipment,
    getRates,
    purchaseLabel,
    getTransaction,
    listTransactions,
    trackShipment,
    registerTracking,
    createCustomsDeclaration,
    createOrder,
    listOrders,
    listCarrierAccounts,
    createManifest,
    schedulePickup,
    createRefund,
    createParcelTemplate,
    listParcelTemplates,
    createBatch,
    purchaseBatch
  ],
  triggers: [trackingUpdated, transactionEvents, batchEvents]
});
