import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageContacts,
  listContacts,
  bulkContactAction,
  sendMessage,
  sendBroadcast,
  listMessages,
  listFlows,
  startFlow,
  listRuns,
  manageCampaigns,
  listCampaigns,
  manageCampaignEvents,
  manageGroups,
  listGroups,
  manageLabels,
  manageFields,
  listTickets,
  manageTickets,
  manageGlobals,
  getWorkspace,
  listChannels
} from './tools';
import { resthookEvent, newMessage, newFlowRun } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageContacts,
    listContacts,
    bulkContactAction,
    sendMessage,
    sendBroadcast,
    listMessages,
    listFlows,
    startFlow,
    listRuns,
    manageCampaigns,
    listCampaigns,
    manageCampaignEvents,
    manageGroups,
    listGroups,
    manageLabels,
    manageFields,
    listTickets,
    manageTickets,
    manageGlobals,
    getWorkspace,
    listChannels
  ],
  triggers: [resthookEvent, newMessage, newFlowRun]
});
