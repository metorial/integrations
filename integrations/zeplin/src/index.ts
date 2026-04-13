import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjects,
  getProject,
  updateProject,
  listProjectMembers,
  inviteProjectMember,
  removeProjectMember,
  listScreens,
  getScreen,
  listScreenVersions,
  listScreenNotes,
  createScreenNote,
  deleteScreenNote,
  addNoteComment,
  listComponents,
  getComponent,
  listStyleguides,
  getStyleguide,
  listColors,
  createProjectColor,
  listTextStyles,
  listSpacingTokens,
  getDesignTokens,
  listFlowBoards,
  getFlowBoard,
  listOrganizations
} from './tools';
import { projectEvents, styleguideEvents, workspaceEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProjects,
    getProject,
    updateProject,
    listProjectMembers,
    inviteProjectMember,
    removeProjectMember,
    listScreens,
    getScreen,
    listScreenVersions,
    listScreenNotes,
    createScreenNote,
    deleteScreenNote,
    addNoteComment,
    listComponents,
    getComponent,
    listStyleguides,
    getStyleguide,
    listColors,
    createProjectColor,
    listTextStyles,
    listSpacingTokens,
    getDesignTokens,
    listFlowBoards,
    getFlowBoard,
    listOrganizations
  ],
  triggers: [projectEvents, styleguideEvents, workspaceEvents]
});
