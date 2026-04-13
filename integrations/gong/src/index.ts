import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCalls,
  getCallDetails,
  getCallTranscripts,
  listUsers,
  getUserActivityStats,
  getScorecards,
  listFlows,
  assignProspectsToFlow,
  unassignProspectFromFlow,
  browseLibrary,
  createMeeting,
  deleteMeeting,
  lookupPrivacyData,
  erasePrivacyData,
  listWorkspaces,
  pushDigitalInteraction,
  getCrmData,
} from './tools';
import { callEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCalls,
    getCallDetails,
    getCallTranscripts,
    listUsers,
    getUserActivityStats,
    getScorecards,
    listFlows,
    assignProspectsToFlow,
    unassignProspectFromFlow,
    browseLibrary,
    createMeeting,
    deleteMeeting,
    lookupPrivacyData,
    erasePrivacyData,
    listWorkspaces,
    pushDigitalInteraction,
    getCrmData,
  ],
  triggers: [
    callEvent,
  ],
});
