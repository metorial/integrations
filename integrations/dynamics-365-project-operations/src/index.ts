import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageExpenses,
  manageFinanceHandoff,
  manageProjectActuals,
  manageProjectContracts,
  manageProjectInvoices,
  manageProjectSchedule,
  manageProjects,
  manageProjectTasks,
  manageResourceAssignments,
  manageTimeEntries
} from './tools';

export let provider = Slate.create({
  spec,
  tools: [
    manageProjects,
    manageProjectTasks,
    manageResourceAssignments,
    manageTimeEntries,
    manageExpenses,
    manageProjectContracts,
    manageProjectActuals,
    manageProjectInvoices,
    manageProjectSchedule,
    manageFinanceHandoff
  ],
  triggers: []
});
