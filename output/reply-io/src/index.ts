import { Slate } from 'slates';
import { spec } from './spec';
import {
  listSequences,
  getSequence,
  manageSequence,
  listContacts,
  manageContact,
  manageSequenceContacts,
  manageTemplate,
  listEmailAccounts,
  manageBlacklist,
  manageContactList,
  getStatistics,
  getTeamPerformance,
  manageTask,
  listSchedules,
  pushContactToCampaign,
} from './tools';
import {
  emailEvents,
  contactEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listSequences,
    getSequence,
    manageSequence,
    listContacts,
    manageContact,
    manageSequenceContacts,
    manageTemplate,
    listEmailAccounts,
    manageBlacklist,
    manageContactList,
    getStatistics,
    getTeamPerformance,
    manageTask,
    listSchedules,
    pushContactToCampaign,
  ],
  triggers: [
    emailEvents,
    contactEvents,
  ],
});
