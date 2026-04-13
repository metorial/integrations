import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageLeadTool,
  getLeadTool,
  listLeadsTool,
  deleteLead,
  manageContact,
  listContacts,
  manageOpportunity,
  listOpportunities,
  manageTask,
  listActivities,
  manageNote,
  sendEmail,
  manageEmailTemplate,
  searchLeads,
  listSmartViews,
  listPipelinesAndStatuses,
  listUsers,
} from './tools';
import {
  leadEventsTrigger,
  contactEventsTrigger,
  opportunityEventsTrigger,
  activityEventsTrigger,
  taskEventsTrigger,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageLeadTool,
    getLeadTool,
    listLeadsTool,
    deleteLead,
    manageContact,
    listContacts,
    manageOpportunity,
    listOpportunities,
    manageTask,
    listActivities,
    manageNote,
    sendEmail,
    manageEmailTemplate,
    searchLeads,
    listSmartViews,
    listPipelinesAndStatuses,
    listUsers,
  ],
  triggers: [
    leadEventsTrigger,
    contactEventsTrigger,
    opportunityEventsTrigger,
    activityEventsTrigger,
    taskEventsTrigger,
  ]
});
