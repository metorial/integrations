import {
  Slate } from 'slates';
import { spec } from './spec';
import { geocodeAddress, reverseGeocode, batchGeocode, calculateDistance, createGeocodingList, getListStatus, getLists, deleteGeocodingList, downloadGeocodingList } from './tools';
import { listCompleted,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    geocodeAddress,
    reverseGeocode,
    batchGeocode,
    calculateDistance,
    createGeocodingList,
    getListStatus,
    getLists,
    deleteGeocodingList,
    downloadGeocodingList,
  ],
  triggers: [
    inboundWebhook,
    listCompleted,
  ],
});
