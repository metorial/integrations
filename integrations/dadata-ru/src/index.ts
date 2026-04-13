import { Slate } from 'slates';
import { spec } from './spec';
import {
  suggestAddress,
  cleanAddress,
  suggestCompany,
  lookupCompany,
  findAffiliatedCompanies,
  lookupCompanyByEmail,
  suggestBank,
  lookupBank,
  cleanContactData,
  geocodeAddress,
  reverseGeocode,
  ipGeolocate,
  searchReferenceDirectory,
  getAccountInfo,
  lookupAddress,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    suggestAddress,
    cleanAddress,
    suggestCompany,
    lookupCompany,
    findAffiliatedCompanies,
    lookupCompanyByEmail,
    suggestBank,
    lookupBank,
    cleanContactData,
    geocodeAddress,
    reverseGeocode,
    ipGeolocate,
    searchReferenceDirectory,
    getAccountInfo,
    lookupAddress,
  ],
  triggers: [
    inboundWebhook,
  ],
});
