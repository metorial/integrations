import { Slate } from 'slates';
import { spec } from './spec';
import {
  upsertCustomer,
  getCustomer,
  listCustomers,
  deleteCustomer,
  updateCustomerCompany,
  createThread,
  getThread,
  listThreads,
  updateThreadStatus,
  assignThread,
  changeThreadPriority,
  replyToThread,
  manageThreadLabels,
  listLabelTypes,
  sendEmail,
  createTimelineEvent,
  upsertTenant,
  manageCustomerTenants,
  manageCustomerGroups,
  listCustomerGroups
} from './tools';
import { threadEvents, messageEvents, customerEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    upsertCustomer,
    getCustomer,
    listCustomers,
    deleteCustomer,
    updateCustomerCompany,
    createThread,
    getThread,
    listThreads,
    updateThreadStatus,
    assignThread,
    changeThreadPriority,
    replyToThread,
    manageThreadLabels,
    listLabelTypes,
    sendEmail,
    createTimelineEvent,
    upsertTenant,
    manageCustomerTenants,
    manageCustomerGroups,
    listCustomerGroups
  ],
  triggers: [threadEvents, messageEvents, customerEvents]
});
