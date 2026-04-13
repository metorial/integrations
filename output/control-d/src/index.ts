import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProfiles,
  manageProfile,
  manageFilters,
  manageServices,
  manageCustomRules,
  manageRuleFolders,
  manageProfileOptions,
  manageDefaultRule,
  listDevices,
  manageDevice,
  manageIpAccess,
  listProxies,
  manageOrganization,
  getAnalyticsConfig,
  getAccountInfo,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listProfiles,
    manageProfile,
    manageFilters,
    manageServices,
    manageCustomRules,
    manageRuleFolders,
    manageProfileOptions,
    manageDefaultRule,
    listDevices,
    manageDevice,
    manageIpAccess,
    listProxies,
    manageOrganization,
    getAnalyticsConfig,
    getAccountInfo,
  ],
  triggers: [
    inboundWebhook,
  ],
});
