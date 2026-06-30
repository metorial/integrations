import { Slate } from 'slates';
import { spec } from './spec';
import {
  getBenefitEnrollment,
  getCompensationPlan,
  getDepartment,
  getEmployee,
  getJob,
  getLeaveBalance,
  getLeaveRequest,
  getPosition,
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
    getEmployee,
    listPositions,
    getPosition,
    listJobs,
    getJob,
    listDepartments,
    getDepartment,
    listLeaveBalances,
    getLeaveBalance,
    listLeaveRequests,
    getLeaveRequest,
    listCompensationPlans,
    getCompensationPlan,
    listBenefitEnrollments,
    getBenefitEnrollment
  ],
  triggers: []
});
