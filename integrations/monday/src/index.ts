import { Slate } from 'slates';
import { spec } from './spec';
import {
  listBoardsTool,
  createBoardTool,
  updateBoardTool,
  listItemsTool,
  createItemTool,
  updateItemTool,
  createSubitemTool,
  listGroupsTool,
  createGroupTool,
  updateGroupTool,
  listColumnsTool,
  createColumnTool,
  listUpdatesTool,
  createUpdateTool,
  deleteUpdateTool,
  listUsersTool,
  listTeamsTool,
  listWorkspacesTool,
  createWorkspaceTool,
  updateWorkspaceTool,
  sendNotificationTool,
  listTagsTool,
  getActivityLogsTool
} from './tools';
import { itemEventsTrigger, columnValueChangesTrigger, updateEventsTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listBoardsTool,
    createBoardTool,
    updateBoardTool,
    listItemsTool,
    createItemTool,
    updateItemTool,
    createSubitemTool,
    listGroupsTool,
    createGroupTool,
    updateGroupTool,
    listColumnsTool,
    createColumnTool,
    listUpdatesTool,
    createUpdateTool,
    deleteUpdateTool,
    listUsersTool,
    listTeamsTool,
    listWorkspacesTool,
    createWorkspaceTool,
    updateWorkspaceTool,
    sendNotificationTool,
    listTagsTool,
    getActivityLogsTool
  ],
  triggers: [itemEventsTrigger, columnValueChangesTrigger, updateEventsTrigger]
});
