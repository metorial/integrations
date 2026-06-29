import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageExpenses,
  manageFinanceHandoff,
  manageProjectActuals,
  manageProjectContracts,
  manageProjectInvoices,
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
    manageFinanceHandoff
  ],
  triggers: []
});
