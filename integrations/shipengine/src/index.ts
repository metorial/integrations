import { Slate } from 'slates';
import { spec } from './spec';
import {
  validateAddress,
  recognizeAddress,
  getRates,
  estimateRates,
  createLabel,
  voidLabel,
  listLabels,
  trackPackage,
  createShipment,
  updateShipment,
  cancelShipment,
  listShipments,
  listCarriers,
  listWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  findServicePoints,
  schedulePickup,
  cancelPickup,
  createManifest
} from './tools';
import {
  trackingTrigger,
  batchCompletedTrigger,
  carrierConnectedTrigger,
  rateUpdatedTrigger,
  reportCompleteTrigger,
  salesOrderImportedTrigger,
  orderSourceRefreshTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    validateAddress,
    recognizeAddress,
    getRates,
    estimateRates,
    createLabel,
    voidLabel,
    listLabels,
    trackPackage,
    createShipment,
    updateShipment,
    cancelShipment,
    listShipments,
    listCarriers,
    listWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    findServicePoints,
    schedulePickup,
    cancelPickup,
    createManifest
  ],
  triggers: [
    trackingTrigger,
    batchCompletedTrigger,
    carrierConnectedTrigger,
    rateUpdatedTrigger,
    reportCompleteTrigger,
    salesOrderImportedTrigger,
    orderSourceRefreshTrigger
  ]
});
