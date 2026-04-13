import { Slate } from 'slates';
import { spec } from './spec';
import {
  getAccounts,
  getLeads,
  getLeadDetails,
  getVisits,
  getCustomFeeds,
  exportLeads,
  getExportStatus,
  getTrackingScript,
  enrichIp
} from './tools';
import { newLeads, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getAccounts,
    getLeads,
    getLeadDetails,
    getVisits,
    getCustomFeeds,
    exportLeads,
    getExportStatus,
    getTrackingScript,
    enrichIp
  ],
  triggers: [inboundWebhook, newLeads]
});
