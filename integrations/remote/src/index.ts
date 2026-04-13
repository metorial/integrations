import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCompanies,
  listEmployments,
  getEmployment,
  createEmployment,
  updateEmployment,
  manageTimeOff,
  manageExpenses,
  manageIncentives,
  manageOffboarding,
  manageTimesheets,
  listCountries,
  getCountryFormSchema,
  estimateEmploymentCost,
  listPayslips,
  listContractAmendments
} from './tools';
import {
  employmentEvents,
  timeoffEvents,
  expenseEvents,
  offboardingEvents,
  payslipEvents,
  incentiveEvents,
  companyEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCompanies,
    listEmployments,
    getEmployment,
    createEmployment,
    updateEmployment,
    manageTimeOff,
    manageExpenses,
    manageIncentives,
    manageOffboarding,
    manageTimesheets,
    listCountries,
    getCountryFormSchema,
    estimateEmploymentCost,
    listPayslips,
    listContractAmendments
  ] as any,
  triggers: [
    employmentEvents,
    timeoffEvents,
    expenseEvents,
    offboardingEvents,
    payslipEvents,
    incentiveEvents,
    companyEvents
  ] as any
});
