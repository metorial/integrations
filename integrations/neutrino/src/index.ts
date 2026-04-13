import { Slate } from 'slates';
import { spec } from './spec';
import {
  validateEmailTool,
  verifyEmailTool,
  validatePhoneTool,
  ipInfoTool,
  ipBlocklistTool,
  ipProbeTool,
  hostReputationTool,
  domainLookupTool,
  geocodeAddressTool,
  geocodeReverseTool,
  binLookupTool,
  convertTool,
  badWordFilterTool,
  smsVerifyTool,
  verifySecurityCodeTool,
  urlInfoTool
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    validateEmailTool,
    verifyEmailTool,
    validatePhoneTool,
    ipInfoTool,
    ipBlocklistTool,
    ipProbeTool,
    hostReputationTool,
    domainLookupTool,
    geocodeAddressTool,
    geocodeReverseTool,
    binLookupTool,
    convertTool,
    badWordFilterTool,
    smsVerifyTool,
    verifySecurityCodeTool,
    urlInfoTool
  ],
  triggers: [inboundWebhook]
});
