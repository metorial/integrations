import { Slate } from 'slates';
import { spec } from './spec';
import {
  createClient,
  createProject,
  createDeal,
  createTask,
  createTasksFromTemplate,
  listClients,
  listProjects,
  listTasks,
  listDeals,
  listTaskTemplates
} from './tools';
import {
  proposalEvents,
  contractEvents,
  invoiceEvents,
  dealUpdated,
  taskUpdated,
  eventScheduled,
  formSubmitted
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createClient,
    createProject,
    createDeal,
    createTask,
    createTasksFromTemplate,
    listClients,
    listProjects,
    listTasks,
    listDeals,
    listTaskTemplates
  ],
  triggers: [
    proposalEvents,
    contractEvents,
    invoiceEvents,
    dealUpdated,
    taskUpdated,
    eventScheduled,
    formSubmitted
  ]
});
