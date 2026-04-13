import { Slate } from 'slates';
import { spec } from './spec';
import {
  lookupIpReputation,
  lookupUrlReputation,
  lookupMalware,
  searchVulnerabilities,
  lookupDnsWhois,
  manageCollections,
  getApiUsage,
  getThreatReport,
  lookupAppProfile
} from './tools';
import {
  newVulnerabilitiesTrigger,
  newThreatReportsTrigger,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    lookupIpReputation,
    lookupUrlReputation,
    lookupMalware,
    searchVulnerabilities,
    lookupDnsWhois,
    manageCollections,
    getApiUsage,
    getThreatReport,
    lookupAppProfile
  ],
  triggers: [inboundWebhook, newVulnerabilitiesTrigger, newThreatReportsTrigger]
});
