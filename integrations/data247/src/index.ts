import { Slate } from 'slates';
import { spec } from './spec';
import {
  carrierLookup,
  smsGatewayLookup,
  verifyEmail,
  verifyPostalAddress,
  verifyPhone,
  reversePhoneLookup,
  reverseEmailLookup,
  appendContactData,
  nameLookup,
  genderLookup,
  zipcodeLookup,
  profileDataLookup,
  propertyDataLookup,
  ipGeolocation,
  dncCheck,
  fraudDetection,
  checkBalance
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    carrierLookup,
    smsGatewayLookup,
    verifyEmail,
    verifyPostalAddress,
    verifyPhone,
    reversePhoneLookup,
    reverseEmailLookup,
    appendContactData,
    nameLookup,
    genderLookup,
    zipcodeLookup,
    profileDataLookup,
    propertyDataLookup,
    ipGeolocation,
    dncCheck,
    fraudDetection,
    checkBalance
  ],
  triggers: [inboundWebhook]
});
