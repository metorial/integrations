import { Slate } from 'slates';
import { spec } from './spec';
import {
  createOrder,
  bulkCreateUpdateOrders,
  getOrders,
  deleteOrders,
  searchOrders,
  optimizeRoutes,
  getPlanningStatus,
  getRoutes,
  getSchedulingInfo,
  updateDriverParameters,
  updateDriverPositions,
  getCompletionDetails,
  updateCompletionDetails
} from './tools';
import { mobileEvents, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createOrder,
    bulkCreateUpdateOrders,
    getOrders,
    deleteOrders,
    searchOrders,
    optimizeRoutes,
    getPlanningStatus,
    getRoutes,
    getSchedulingInfo,
    updateDriverParameters,
    updateDriverPositions,
    getCompletionDetails,
    updateCompletionDetails
  ],
  triggers: [inboundWebhook, mobileEvents]
});
