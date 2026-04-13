import { Slate } from 'slates';
import { spec } from './spec';
import {
  listOrganizations,
  listSites,
  listAudits,
  getAudit,
  listRiskModels,
  listCategories,
  listCorrectiveActions,
  getComplianceData,
  listMembers,
  listPropertyInsuranceItems,
  getCopeData
} from './tools';
import {
  newAuditTrigger,
  newCorrectiveActionTrigger,
  newMemberTrigger,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listOrganizations,
    listSites,
    listAudits,
    getAudit,
    listRiskModels,
    listCategories,
    listCorrectiveActions,
    getComplianceData,
    listMembers,
    listPropertyInsuranceItems,
    getCopeData
  ],
  triggers: [inboundWebhook, newAuditTrigger, newCorrectiveActionTrigger, newMemberTrigger]
});
