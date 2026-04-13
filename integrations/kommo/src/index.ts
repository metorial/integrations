import { Slate } from 'slates';
import { spec } from './spec';
import {
  listLeadsTool,
  getLeadTool,
  createLeadTool,
  updateLeadTool,
  listContactsTool,
  getContactTool,
  createContactTool,
  updateContactTool,
  listCompaniesTool,
  getCompanyTool,
  createCompanyTool,
  updateCompanyTool,
  listTasksTool,
  createTaskTool,
  updateTaskTool,
  listPipelinesTool,
  addNoteTool,
  listNotesTool,
  manageTagsTool,
  listUsersTool,
  listCustomFieldsTool,
  manageEntityLinksTool,
  getAccountTool,
  listEventsTool
} from './tools';
import {
  leadEventsTrigger,
  contactEventsTrigger,
  companyEventsTrigger,
  taskEventsTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listLeadsTool,
    getLeadTool,
    createLeadTool,
    updateLeadTool,
    listContactsTool,
    getContactTool,
    createContactTool,
    updateContactTool,
    listCompaniesTool,
    getCompanyTool,
    createCompanyTool,
    updateCompanyTool,
    listTasksTool,
    createTaskTool,
    updateTaskTool,
    listPipelinesTool,
    addNoteTool,
    listNotesTool,
    manageTagsTool,
    listUsersTool,
    listCustomFieldsTool,
    manageEntityLinksTool,
    getAccountTool,
    listEventsTool
  ],
  triggers: [leadEventsTrigger, contactEventsTrigger, companyEventsTrigger, taskEventsTrigger]
});
