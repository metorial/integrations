import { Slate } from 'slates';
import { spec } from './spec';
import {
  listContracts,
  getContract,
  createContract,
  manageContract,
  listPeople,
  getPerson,
  manageTimesheets,
  manageTimeOff,
  manageInvoiceAdjustments,
  listInvoices,
  listPayments,
  listOrganizationData,
  getEorCountryGuide,
  calculateEorCost
} from './tools';
import {
  contractEvents,
  workerEvents,
  timesheetEvents,
  timeOffEvents,
  paymentEvents,
  invoiceAdjustmentEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listContracts,
    getContract,
    createContract,
    manageContract,
    listPeople,
    getPerson,
    manageTimesheets,
    manageTimeOff,
    manageInvoiceAdjustments,
    listInvoices,
    listPayments,
    listOrganizationData,
    getEorCountryGuide,
    calculateEorCost
  ],
  triggers: [
    contractEvents,
    workerEvents,
    timesheetEvents,
    timeOffEvents,
    paymentEvents,
    invoiceAdjustmentEvents
  ]
});
