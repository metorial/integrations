import { Slate } from 'slates';
import { spec } from './spec';
import {
  getWorker,
  listBenefitEnrollments,
  listCompensationPlans,
  listDepartments,
  listEmployees,
  listJobs,
  listLeaveBalances,
  listLeaveRequests,
  listPositions,
  listWorkers
} from './tools';

export let provider = Slate.create({
  spec,
  tools: [
    listWorkers,
    getWorker,
    listEmployees,
    listPositions,
    listJobs,
    listDepartments,
    listLeaveBalances,
    listLeaveRequests,
    listCompensationPlans,
    listBenefitEnrollments
  ],
  triggers: []
});
