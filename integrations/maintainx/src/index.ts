import { Slate } from 'slates';
import { spec } from './spec';
import {
  createWorkOrder,
  updateWorkOrder,
  getWorkOrder,
  listWorkOrders,
  createWorkRequest,
  createAsset,
  updateAsset,
  getAsset,
  listAssets,
  deleteAsset,
  setAssetStatus,
  listLocations,
  createLocation,
  listParts,
  createPart,
  listMeters,
  createMeterReading,
  listPurchaseOrders,
  createPurchaseOrder,
  listVendors,
  createVendor,
  listUsers,
  listTeams,
  listCategories,
  sendMessage
} from './tools';
import {
  newWorkOrder,
  workOrderStatusChanged,
  newWorkRequest,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createWorkOrder,
    updateWorkOrder,
    getWorkOrder,
    listWorkOrders,
    createWorkRequest,
    createAsset,
    updateAsset,
    getAsset,
    listAssets,
    deleteAsset,
    setAssetStatus,
    listLocations,
    createLocation,
    listParts,
    createPart,
    listMeters,
    createMeterReading,
    listPurchaseOrders,
    createPurchaseOrder,
    listVendors,
    createVendor,
    listUsers,
    listTeams,
    listCategories,
    sendMessage
  ],
  triggers: [inboundWebhook, newWorkOrder, workOrderStatusChanged, newWorkRequest]
});
