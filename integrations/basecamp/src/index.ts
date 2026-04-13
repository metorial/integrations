import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjectsTool,
  getProjectTool,
  createProjectTool,
  updateProjectTool,
  listTodoListsTool,
  manageTodoListTool,
  listTodosTool,
  manageTodoTool,
  listMessagesTool,
  manageMessageTool,
  manageCommentTool,
  sendCampfireMessageTool,
  manageScheduleEntryTool,
  listPeopleTool
} from './tools';
import { projectEventsTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProjectsTool,
    getProjectTool,
    createProjectTool,
    updateProjectTool,
    listTodoListsTool,
    manageTodoListTool,
    listTodosTool,
    manageTodoTool,
    listMessagesTool,
    manageMessageTool,
    manageCommentTool,
    sendCampfireMessageTool,
    manageScheduleEntryTool,
    listPeopleTool
  ],
  triggers: [projectEventsTrigger]
});
