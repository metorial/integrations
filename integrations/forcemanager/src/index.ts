import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageAccount,
  getAccount,
  manageContact,
  getContact,
  manageActivity,
  getActivity,
  manageOpportunity,
  getOpportunity,
  manageProduct,
  getProduct,
  manageSalesOrder,
  getSalesOrder,
  manageSalesOrderLine,
  manageCalendarEntry,
  getCalendarEntry,
  getUser,
  getValues,
  lookupExternalId
} from './tools';
import {
  accountChanges,
  contactChanges,
  opportunityChanges,
  activityChanges,
  salesOrderChanges,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageAccount,
    getAccount,
    manageContact,
    getContact,
    manageActivity,
    getActivity,
    manageOpportunity,
    getOpportunity,
    manageProduct,
    getProduct,
    manageSalesOrder,
    getSalesOrder,
    manageSalesOrderLine,
    manageCalendarEntry,
    getCalendarEntry,
    getUser,
    getValues,
    lookupExternalId
  ],
  triggers: [
    inboundWebhook,
    accountChanges,
    contactChanges,
    opportunityChanges,
    activityChanges,
    salesOrderChanges
  ]
});
