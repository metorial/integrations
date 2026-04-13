import { Slate } from 'slates';
import { spec } from './spec';
import {
  createIssueTool,
  getIssueTool,
  updateIssueTool,
  deleteIssueTool,
  searchIssuesTool,
  addCommentTool,
  listCommentsTool,
  logWorkTool,
  listProjectsTool,
  listSprintsTool,
  createSprintTool,
  moveIssuesToSprintTool,
  listBoardsTool,
  listVersionsTool,
  createVersionTool,
  updateVersionTool,
  linkIssuesTool,
  listIssueLinkTypesTool,
  createFilterTool,
  listFavouriteFiltersTool,
  searchUsersTool,
  getTransitionsTool
} from './tools';
import {
  issueEventsTrigger,
  commentEventsTrigger,
  sprintEventsTrigger,
  projectEventsTrigger,
  versionEventsTrigger,
  worklogEventsTrigger,
  boardEventsTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createIssueTool,
    getIssueTool,
    updateIssueTool,
    deleteIssueTool,
    searchIssuesTool,
    addCommentTool,
    listCommentsTool,
    logWorkTool,
    listProjectsTool,
    listSprintsTool,
    createSprintTool,
    moveIssuesToSprintTool,
    listBoardsTool,
    listVersionsTool,
    createVersionTool,
    updateVersionTool,
    linkIssuesTool,
    listIssueLinkTypesTool,
    createFilterTool,
    listFavouriteFiltersTool,
    searchUsersTool,
    getTransitionsTool
  ],
  triggers: [
    issueEventsTrigger,
    commentEventsTrigger,
    sprintEventsTrigger,
    projectEventsTrigger,
    versionEventsTrigger,
    worklogEventsTrigger,
    boardEventsTrigger
  ]
});
