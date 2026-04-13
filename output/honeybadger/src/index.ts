import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjects,
  manageProject,
  searchErrors,
  getErrorDetails,
  manageError,
  manageUptime,
  listOutages,
  manageCheckIns,
  manageDeployments,
  manageTeams,
  queryInsights,
  sendEvents,
  reportCheckIn,
  reportError,
  manageEnvironments,
} from './tools';
import {
  errorEvent,
  uptimeEvent,
  checkInEvent,
  deployEvent,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProjects,
    manageProject,
    searchErrors,
    getErrorDetails,
    manageError,
    manageUptime,
    listOutages,
    manageCheckIns,
    manageDeployments,
    manageTeams,
    queryInsights,
    sendEvents,
    reportCheckIn,
    reportError,
    manageEnvironments,
  ],
  triggers: [
    errorEvent,
    uptimeEvent,
    checkInEvent,
    deployEvent,
  ],
});
