import { Slate } from 'slates';
import { spec } from './spec';
import {
  listReservations,
  getReservation,
  createBooking,
  manageReservation,
  searchOffers,
  listProperties,
  listUnits,
  changeUnitState,
  listUnitGroups,
  listRatePlans,
  listFolios,
  manageFolio,
  manageInvoice,
  manageCompany,
  listBlocks,
  triggerNightAudit
} from './tools';
import {
  reservationEvents,
  bookingEvents,
  folioEvents,
  invoiceEvents,
  propertyEvents,
  nightAuditEvents,
  blockEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listReservations,
    getReservation,
    createBooking,
    manageReservation,
    searchOffers,
    listProperties,
    listUnits,
    changeUnitState,
    listUnitGroups,
    listRatePlans,
    listFolios,
    manageFolio,
    manageInvoice,
    manageCompany,
    listBlocks,
    triggerNightAudit
  ],
  triggers: [
    reservationEvents,
    bookingEvents,
    folioEvents,
    invoiceEvents,
    propertyEvents,
    nightAuditEvents,
    blockEvents
  ]
});
