import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  hireEmployee,
  updateEmployee,
  listEmployees,
  createDepartment,
  createDivision,
  createJobTitle,
  createLocation,
  respondTimeOffRequest,
  listTimeOffRequests,
  listOrganizationalStructure,
  listJobApplications,
} from './tools';
import {
  newEmployee,
  newJobApplication,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    hireEmployee,
    updateEmployee,
    listEmployees,
    createDepartment,
    createDivision,
    createJobTitle,
    createLocation,
    respondTimeOffRequest,
    listTimeOffRequests,
    listOrganizationalStructure,
    listJobApplications,
  ],
  triggers: [
    inboundWebhook,
    newEmployee,
    newJobApplication,
  ],
});
