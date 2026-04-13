import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listOrganizations,
  listServerProviders,
  listServers,
  getServerDetails,
  createServer,
  manageServer,
  manageServices,
  listApplications,
  createApplication,
  manageApplication,
  manageDomains,
  manageSsl,
  manageDatabase,
  manageFirewall,
  manageCronJobs,
  listBackups,
  manageSystemUsers,
} from './tools';
import {
  serverChanges,
  applicationChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listOrganizations,
    listServerProviders,
    listServers,
    getServerDetails,
    createServer,
    manageServer,
    manageServices,
    listApplications,
    createApplication,
    manageApplication,
    manageDomains,
    manageSsl,
    manageDatabase,
    manageFirewall,
    manageCronJobs,
    listBackups,
    manageSystemUsers,
  ],
  triggers: [
    inboundWebhook,
    serverChanges,
    applicationChanges,
  ],
});
