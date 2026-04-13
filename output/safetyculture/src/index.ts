import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchInspections,
  getInspection,
  manageInspection,
  listTemplates,
  getTemplate,
  listActions,
  createAction,
  updateAction,
  deleteActions,
  listIssues,
  getIssue,
  createIssue,
  updateIssue,
  addIssueComment,
  listUsersAndGroups,
  manageSchedules,
  manageAssets,
} from './tools';
import {
  inspectionEvents,
  actionEvents,
  issueEvents,
  mediaEvents,
  trainingEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchInspections,
    getInspection,
    manageInspection,
    listTemplates,
    getTemplate,
    listActions,
    createAction,
    updateAction,
    deleteActions,
    listIssues,
    getIssue,
    createIssue,
    updateIssue,
    addIssueComment,
    listUsersAndGroups,
    manageSchedules,
    manageAssets,
  ],
  triggers: [
    inspectionEvents,
    actionEvents,
    issueEvents,
    mediaEvents,
    trainingEvents,
  ],
});
