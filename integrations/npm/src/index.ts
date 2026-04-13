import { Slate } from 'slates';
import { spec } from './spec';
import {
  getPackage,
  searchPackages,
  getDownloads,
  manageDistTags,
  manageTokens,
  deprecatePackage,
  manageTrustedPublishers,
  getUserProfile,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    getPackage,
    searchPackages,
    getDownloads,
    manageDistTags,
    manageTokens,
    deprecatePackage,
    manageTrustedPublishers,
    getUserProfile,
  ],
  triggers: [
    inboundWebhook,
  ],
});
