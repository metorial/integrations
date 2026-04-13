import { Slate } from 'slates';
import { spec } from './spec';
import {
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  listPolicies,
  managePolicy,
  manageScheduledPolicy,
  listNetworks,
  manageNetwork,
  manageNetworkSecretKey,
  manageIpAddresses,
  listRoamingClients,
  manageRoamingClient,
  manageOrganizationUsers,
  manageCollection,
  manageCollectionUsers,
  manageBlockPage,
  lookupDomain,
  suggestDomainCategorization,
  listCategories,
  manageMacAddresses,
  getTrafficReport,
  getQueryLog,
  getBilling
} from './tools';
import {
  organizationChanges,
  roamingClientChanges,
  networkChanges,
  policyChanges,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listOrganizations,
    getOrganization,
    createOrganization,
    updateOrganization,
    listPolicies,
    managePolicy,
    manageScheduledPolicy,
    listNetworks,
    manageNetwork,
    manageNetworkSecretKey,
    manageIpAddresses,
    listRoamingClients,
    manageRoamingClient,
    manageOrganizationUsers,
    manageCollection,
    manageCollectionUsers,
    manageBlockPage,
    lookupDomain,
    suggestDomainCategorization,
    listCategories,
    manageMacAddresses,
    getTrafficReport,
    getQueryLog,
    getBilling
  ],
  triggers: [
    inboundWebhook,
    organizationChanges,
    roamingClientChanges,
    networkChanges,
    policyChanges
  ]
});
