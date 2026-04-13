import { Slate } from 'slates';
import { spec } from './spec';
import {
  createQrCode,
  listQrCodes,
  getQrCode,
  updateQrCode,
  deleteQrCode,
  manageGeofence,
  listGeofences,
  listBeacons,
  updateBeacon,
  listNfcTags,
  updateNfcTag,
  getAnalytics,
  listPlaces,
  manageLandingPage,
  getFormResponses
} from './tools';
import { newQrCode, newFormResponse, newGeofence, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createQrCode,
    listQrCodes,
    getQrCode,
    updateQrCode,
    deleteQrCode,
    manageGeofence,
    listGeofences,
    listBeacons,
    updateBeacon,
    listNfcTags,
    updateNfcTag,
    getAnalytics,
    listPlaces,
    manageLandingPage,
    getFormResponses
  ],
  triggers: [inboundWebhook, newQrCode, newFormResponse, newGeofence]
});
