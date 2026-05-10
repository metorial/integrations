import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCalls,
  createCall,
  addCallMedia,
  getCallDetails,
  getCallTranscripts,
  listUsers,
  getUser,
  listUsersByFilter,
  getUserActivityStats,
  getScorecards,
  getSettingsDefinitions,
  listFlows,
  assignProspectsToFlow,
  unassignProspectFromFlow,
  browseLibrary,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  manageCallUserAccess,
  lookupPrivacyData,
  erasePrivacyData,
  listWorkspaces,
  pushDigitalInteraction,
  getCrmData,
  getCrmMetadata
} from './tools';
import { callEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCalls,
    createCall,
    addCallMedia,
    getCallDetails,
    getCallTranscripts,
    listUsers,
    getUser,
    listUsersByFilter,
    getUserActivityStats,
    getScorecards,
    getSettingsDefinitions,
    listFlows,
    assignProspectsToFlow,
    unassignProspectFromFlow,
    browseLibrary,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    manageCallUserAccess,
    lookupPrivacyData,
    erasePrivacyData,
    listWorkspaces,
    pushDigitalInteraction,
    getCrmData,
    getCrmMetadata
  ],
  triggers: [callEvent]
});
