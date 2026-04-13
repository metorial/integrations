import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendPush,
  listPushes,
  managePush,
  listDevices,
  manageDevice,
  sendSms,
  listChats,
  manageChat,
  listSubscriptions,
  manageSubscription,
  getChannelInfo,
  sendClipboard,
  requestFileUpload
} from './tools';
import { newPush, deviceChanged, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendPush,
    listPushes,
    managePush,
    listDevices,
    manageDevice,
    sendSms,
    listChats,
    manageChat,
    listSubscriptions,
    manageSubscription,
    getChannelInfo,
    sendClipboard,
    requestFileUpload
  ],
  triggers: [inboundWebhook, newPush, deviceChanged]
});
