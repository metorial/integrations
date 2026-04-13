import { Slate } from 'slates';
import { spec } from './spec';
import {
  domainWhoisLookup,
  historicalWhoisLookup,
  reverseWhoisSearch,
  ipAsnWhoisLookup,
  dnsLookup,
  historicalDnsLookup,
  reverseDnsLookup,
  subdomainDiscovery,
  domainAvailability,
  domainDiscovery,
  sslCertificateLookup,
  ipGeolocation,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    domainWhoisLookup,
    historicalWhoisLookup,
    reverseWhoisSearch,
    ipAsnWhoisLookup,
    dnsLookup,
    historicalDnsLookup,
    reverseDnsLookup,
    subdomainDiscovery,
    domainAvailability,
    domainDiscovery,
    sslCertificateLookup,
    ipGeolocation,
  ],
  triggers: [
    inboundWebhook,
  ],
});
