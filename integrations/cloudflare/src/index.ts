import { Slate } from 'slates';
import { spec } from './spec';
import {
  listDnsRecordsTool,
  manageDnsRecordTool,
  listZonesTool,
  manageZoneTool,
  purgeCacheTool,
  updateZoneSettingsTool,
  manageFirewallRulesTool,
  listWorkersTool,
  manageWorkerRoutesTool,
  manageKvTool,
  manageR2BucketsTool,
  manageLoadBalancerTool,
  managePagesTool,
  manageSslCertificatesTool,
  manageAccountTool,
  queryAnalyticsTool,
  manageDomainsTool,
  manageStreamTool,
  manageNotificationsTool
} from './tools';
import {
  notificationWebhookTrigger,
  dnsRecordChangesTrigger,
  zoneStatusChangesTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listDnsRecordsTool,
    manageDnsRecordTool,
    listZonesTool,
    manageZoneTool,
    purgeCacheTool,
    updateZoneSettingsTool,
    manageFirewallRulesTool,
    listWorkersTool,
    manageWorkerRoutesTool,
    manageKvTool,
    manageR2BucketsTool,
    manageLoadBalancerTool,
    managePagesTool,
    manageSslCertificatesTool,
    manageAccountTool,
    queryAnalyticsTool,
    manageDomainsTool,
    manageStreamTool,
    manageNotificationsTool
  ],
  triggers: [notificationWebhookTrigger, dnsRecordChangesTrigger, zoneStatusChangesTrigger]
});
