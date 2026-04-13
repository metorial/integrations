import { Slate } from 'slates';
import { spec } from './spec';
import {
  validateEmail,
  validatePhone,
  geolocateIp,
  enrichCompany,
  exchangeRates,
  publicHolidays,
  timezone,
  scrapeWebsite,
  captureScreenshot,
  validateVat,
  validateIban,
  processImage,
  generateAvatar
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    validateEmail,
    validatePhone,
    geolocateIp,
    enrichCompany,
    exchangeRates,
    publicHolidays,
    timezone,
    scrapeWebsite,
    captureScreenshot,
    validateVat,
    validateIban,
    processImage,
    generateAvatar
  ],
  triggers: [inboundWebhook]
});
