import { Slate } from 'slates';
import { spec } from './spec';
import {
  listBuildProfiles,
  getBuildProfile,
  startBuild,
  getBuildStatus,
  cancelBuild,
  listWorkflows,
  listConfigurations,
  manageEnvironmentVariables,
  listDistributionProfiles,
  manageDistribution,
  manageTestingGroups,
  listSigningIdentities,
  managePublish,
  manageEnterpriseStore,
  listOrganizations,
  manageWebhooks
} from './tools';
import {
  buildEvents,
  distributionEvents,
  signingIdentityEvents,
  publishEvents,
  enterpriseStoreEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listBuildProfiles,
    getBuildProfile,
    startBuild,
    getBuildStatus,
    cancelBuild,
    listWorkflows,
    listConfigurations,
    manageEnvironmentVariables,
    listDistributionProfiles,
    manageDistribution,
    manageTestingGroups,
    listSigningIdentities,
    managePublish,
    manageEnterpriseStore,
    listOrganizations,
    manageWebhooks
  ],
  triggers: [
    buildEvents,
    distributionEvents,
    signingIdentityEvents,
    publishEvents,
    enterpriseStoreEvents
  ]
});
