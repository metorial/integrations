import { Slate } from 'slates';
import { spec } from './spec';
import {
  listItems,
  getItem,
  updateItem,
  listOccurrences,
  getOccurrence,
  createDeploy,
  listDeploys,
  manageProject,
  manageTeam,
  manageTeamMembers,
  manageTeamProjects,
  runRqlQuery,
  getMetrics,
  manageNotificationRules,
  listEnvironments,
  manageAccessTokens,
  manageServiceLinks,
  listUsers,
  getVersion,
} from './tools';
import {
  itemEvent,
  deployEvent,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listItems,
    getItem,
    updateItem,
    listOccurrences,
    getOccurrence,
    createDeploy,
    listDeploys,
    manageProject,
    manageTeam,
    manageTeamMembers,
    manageTeamProjects,
    runRqlQuery,
    getMetrics,
    manageNotificationRules,
    listEnvironments,
    manageAccessTokens,
    manageServiceLinks,
    listUsers,
    getVersion,
  ],
  triggers: [
    itemEvent,
    deployEvent,
  ],
});
