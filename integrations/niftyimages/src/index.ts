import { Slate } from 'slates';
import { spec } from './spec';
import {
  getDataStoreFields,
  manageDataStoreRecord,
  updateTimer,
  listMaps,
  manageMapLocation,
  listImages,
  getImageStats,
  deleteImage,
  managePhotoshopImage,
  getWidgetStats,
  suspendWidgetUser
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    getDataStoreFields,
    manageDataStoreRecord,
    updateTimer,
    listMaps,
    manageMapLocation,
    listImages,
    getImageStats,
    deleteImage,
    managePhotoshopImage,
    getWidgetStats,
    suspendWidgetUser
  ],
  triggers: [inboundWebhook]
});
