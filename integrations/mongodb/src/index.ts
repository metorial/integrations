import { Slate } from 'slates';
import { spec } from './spec';
import {
  listOrganizationsTool,
  listProjectsTool,
  manageProjectTool,
  listClustersTool,
  manageClusterTool,
  manageDatabaseUserTool,
  manageIpAccessListTool,
  manageAlertsTool,
  manageAlertConfigurationsTool,
  manageBackupsTool,
  manageSearchIndexesTool,
  getMetricsTool,
  getNetworkInfoTool,
  listEventsTool,
  getBillingTool
} from './tools';
import { alertWebhookTrigger, projectEventsTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listOrganizationsTool,
    listProjectsTool,
    manageProjectTool,
    listClustersTool,
    manageClusterTool,
    manageDatabaseUserTool,
    manageIpAccessListTool,
    manageAlertsTool,
    manageAlertConfigurationsTool,
    manageBackupsTool,
    manageSearchIndexesTool,
    getMetricsTool,
    getNetworkInfoTool,
    listEventsTool,
    getBillingTool
  ],
  triggers: [alertWebhookTrigger, projectEventsTrigger]
});
