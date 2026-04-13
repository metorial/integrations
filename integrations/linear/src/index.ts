import { Slate } from 'slates';
import { spec } from './spec';
import {
  createIssueTool,
  updateIssueTool,
  getIssueTool,
  listIssuesTool,
  deleteIssueTool,
  searchIssuesTool,
  createProjectTool,
  updateProjectTool,
  listProjectsTool,
  getProjectTool,
  createCommentTool,
  updateCommentTool,
  deleteCommentTool,
  createCycleTool,
  updateCycleTool,
  listCyclesTool,
  listTeamsTool,
  getTeamTool,
  createLabelTool,
  updateLabelTool,
  listLabelsTool,
  createDocumentTool,
  updateDocumentTool,
  listDocumentsTool,
  getViewerTool,
  listUsersTool,
  listWorkflowStatesTool
} from './tools';
import {
  issueEventsTrigger,
  commentEventsTrigger,
  projectEventsTrigger,
  cycleEventsTrigger,
  documentEventsTrigger,
  labelEventsTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createIssueTool,
    updateIssueTool,
    getIssueTool,
    listIssuesTool,
    deleteIssueTool,
    searchIssuesTool,
    createProjectTool,
    updateProjectTool,
    listProjectsTool,
    getProjectTool,
    createCommentTool,
    updateCommentTool,
    deleteCommentTool,
    createCycleTool,
    updateCycleTool,
    listCyclesTool,
    listTeamsTool,
    getTeamTool,
    createLabelTool,
    updateLabelTool,
    listLabelsTool,
    createDocumentTool,
    updateDocumentTool,
    listDocumentsTool,
    getViewerTool,
    listUsersTool,
    listWorkflowStatesTool
  ],
  triggers: [
    issueEventsTrigger,
    commentEventsTrigger,
    projectEventsTrigger,
    cycleEventsTrigger,
    documentEventsTrigger,
    labelEventsTrigger
  ]
});
