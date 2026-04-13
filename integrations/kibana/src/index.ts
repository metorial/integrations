import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  searchSavedObjects,
  manageSavedObject,
  exportSavedObjects,
  listDataViews,
  manageDataView,
  listSpaces,
  manageSpace,
  searchRules,
  manageRule,
  listConnectors,
  manageConnector,
  executeConnector,
  searchCases,
  manageCase,
  addCaseComment,
  searchSLOs,
  manageSLO,
  listAgentPolicies,
  manageAgentPolicy,
  listFleetAgents,
  getEnrollmentTokens,
  listRoles,
  manageRole,
  getKibanaStatus
} from './tools';
import {
  ruleStatusChanges,
  caseChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchSavedObjects,
    manageSavedObject,
    exportSavedObjects,
    listDataViews,
    manageDataView,
    listSpaces,
    manageSpace,
    searchRules,
    manageRule,
    listConnectors,
    manageConnector,
    executeConnector,
    searchCases,
    manageCase,
    addCaseComment,
    searchSLOs,
    manageSLO,
    listAgentPolicies,
    manageAgentPolicy,
    listFleetAgents,
    getEnrollmentTokens,
    listRoles,
    manageRole,
    getKibanaStatus
  ],
  triggers: [
    inboundWebhook,
    ruleStatusChanges,
    caseChanges
  ]
});
