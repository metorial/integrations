import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageProducts,
  manageOrders,
  manageContacts,
  manageBlog,
  manageBookings,
  manageEvents,
  manageCollections,
  getSiteProperties,
  manageDataItems,
  managePricingPlans,
  manageMembers,
  manageMedia,
} from './tools';
import {
  ecommerceEvents,
  catalogEvents,
  contactEvents,
  bookingEvents,
  blogEvents,
  siteEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageProducts,
    manageOrders,
    manageContacts,
    manageBlog,
    manageBookings,
    manageEvents,
    manageCollections,
    getSiteProperties,
    manageDataItems,
    managePricingPlans,
    manageMembers,
    manageMedia,
  ],
  triggers: [
    ecommerceEvents,
    catalogEvents,
    contactEvents,
    bookingEvents,
    blogEvents,
    siteEvents,
  ],
});
