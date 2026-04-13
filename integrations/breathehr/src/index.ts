import { Slate } from 'slates';
import { spec } from './spec';
import {
  listEmployees,
  getEmployee,
  createEmployee,
  listAbsences,
  cancelAbsence,
  manageLeaveRequest,
  listLeaveRequests,
  listSicknesses,
  createSickness,
  manageExpense,
  manageExpenseClaim,
  listBonuses,
  listSalaries,
  listOrganization,
  getDepartmentData,
  listTraining,
  listWorkingPatterns,
  listHolidayAllowances,
  listOtherLeaveReasons,
  getAccount
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listEmployees,
    getEmployee,
    createEmployee,
    listAbsences,
    cancelAbsence,
    manageLeaveRequest,
    listLeaveRequests,
    listSicknesses,
    createSickness,
    manageExpense,
    manageExpenseClaim,
    listBonuses,
    listSalaries,
    listOrganization,
    getDepartmentData,
    listTraining,
    listWorkingPatterns,
    listHolidayAllowances,
    listOtherLeaveReasons,
    getAccount
  ],
  triggers: [inboundWebhook]
});
