import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchCreations,
  browseCreations,
  getCreation,
  getMyProfile,
  getUser,
  getMySales,
  getMyOrders,
  getMyCreations,
  createCreation,
  updateCreation,
  getCategories,
  getMyPrintlists,
  createPrintlist,
  updatePrintlist,
  deletePrintlist,
  addCreationToPrintlist,
  removeCreationFromPrintlist,
  createDiscount,
  notifyDownloaders
} from './tools';
import { newSaleTrigger, newOrderTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchCreations,
    browseCreations,
    getCreation,
    getMyProfile,
    getUser,
    getMySales,
    getMyOrders,
    getMyCreations,
    createCreation,
    updateCreation,
    getCategories,
    getMyPrintlists,
    createPrintlist,
    updatePrintlist,
    deletePrintlist,
    addCreationToPrintlist,
    removeCreationFromPrintlist,
    createDiscount,
    notifyDownloaders
  ],
  triggers: [inboundWebhook, newSaleTrigger, newOrderTrigger]
});
