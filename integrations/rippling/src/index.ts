import { Slate } from 'slates';
import { spec } from './spec';
import {
  listEmployees,
  getEmployee,
  getCompany,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  listLeaveRequests,
  processLeaveRequest,
  pushCandidate,
  listDepartments,
  listTeams,
  listWorkLocations,
  listLevels,
  getSamlMetadata,
  listLeaveTypes,
  getLeaveBalances,
  getCurrentUser,
  listCustomFields,
} from './tools';
import {
  employeeLifecycle,
  companyActivity,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listEmployees,
    getEmployee,
    getCompany,
    createGroup,
    getGroup,
    updateGroup,
    deleteGroup,
    listLeaveRequests,
    processLeaveRequest,
    pushCandidate,
    listDepartments,
    listTeams,
    listWorkLocations,
    listLevels,
    getSamlMetadata,
    listLeaveTypes,
    getLeaveBalances,
    getCurrentUser,
    listCustomFields,
  ],
  triggers: [
    employeeLifecycle,
    companyActivity,
  ],
});
