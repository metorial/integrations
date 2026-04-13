import { Slate } from 'slates';
import { spec } from './spec';

import {
  listUsersTool,
  listClientsTool,
  getClientTool,
  createClientTool,
  updateClientTool,
  listProjectsTool,
  getProjectTool,
  createProjectTool,
  updateProjectTool,
  listServicesTool,
  createServiceTool,
  updateServiceTool,
  searchTimeEntriesTool,
  getTimeEntryTool,
  createTimeEntryTool,
  updateTimeEntryTool,
  deleteTimeEntryTool
} from './tools';

import { timeEntryEventsTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listUsersTool,
    listClientsTool,
    getClientTool,
    createClientTool,
    updateClientTool,
    listProjectsTool,
    getProjectTool,
    createProjectTool,
    updateProjectTool,
    listServicesTool,
    createServiceTool,
    updateServiceTool,
    searchTimeEntriesTool,
    getTimeEntryTool,
    createTimeEntryTool,
    updateTimeEntryTool,
    deleteTimeEntryTool
  ],
  triggers: [timeEntryEventsTrigger]
});
