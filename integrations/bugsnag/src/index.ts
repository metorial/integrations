import { Slate } from 'slates';
import { spec } from './spec';
import {
  listOrganizations,
  listProjects,
  getProject,
  manageProject,
  listErrors,
  getError,
  updateError,
  listEvents,
  getEvent,
  getErrorTrends,
  listReleases,
  manageCollaborators,
  manageComments,
  getStability,
  getPivots,
  manageSavedSearches
} from './tools';
import { errorEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listOrganizations,
    listProjects,
    getProject,
    manageProject,
    listErrors,
    getError,
    updateError,
    listEvents,
    getEvent,
    getErrorTrends,
    listReleases,
    manageCollaborators,
    manageComments,
    getStability,
    getPivots,
    manageSavedSearches
  ],
  triggers: [errorEvents]
});
