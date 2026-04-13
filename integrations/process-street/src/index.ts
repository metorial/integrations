import { Slate } from 'slates';
import { spec } from './spec';
import {
  listWorkflows,
  listWorkflowRuns,
  createWorkflowRun,
  getWorkflowRun,
  updateWorkflowRun,
  deleteWorkflowRun,
  listTasks,
  updateTask,
  manageTaskAssignees,
  manageApprovals,
  listWorkflowFormFields,
  manageFormFields,
  listDataSets,
  manageDataSetRecords,
  listUsers
} from './tools';
import { workflowRunEvents, dataSetEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listWorkflows,
    listWorkflowRuns,
    createWorkflowRun,
    getWorkflowRun,
    updateWorkflowRun,
    deleteWorkflowRun,
    listTasks,
    updateTask,
    manageTaskAssignees,
    manageApprovals,
    listWorkflowFormFields,
    manageFormFields,
    listDataSets,
    manageDataSetRecords,
    listUsers
  ],
  triggers: [workflowRunEvents, dataSetEvents]
});
