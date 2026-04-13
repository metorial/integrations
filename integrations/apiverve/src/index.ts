import { Slate } from 'slates';
import { spec } from './spec';
import {
  validateEmail,
  validatePhone,
  getWeather,
  convertCurrency,
  dnsLookup,
  checkSsl,
  lookupIp,
  analyzeSentiment,
  checkSpelling,
  generateQrCode,
  callApi,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    validateEmail,
    validatePhone,
    getWeather,
    convertCurrency,
    dnsLookup,
    checkSsl,
    lookupIp,
    analyzeSentiment,
    checkSpelling,
    generateQrCode,
    callApi,
  ],
  triggers: [
    inboundWebhook,
  ],
});
