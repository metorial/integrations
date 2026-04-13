import { Slate } from 'slates';
import { spec } from './spec';
import {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  listContacts,
  createContact,
  updateContact,
  deleteContact,
  listCalendars,
  getAvailableTimeSlots,
  getWorkingTimes,
  listServices,
  createService,
  updateService,
  deleteService,
  listServiceGroups,
  createVoucher,
  listVouchers,
  getCompanyInfo,
} from './tools';
import { appointmentEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    listContacts,
    createContact,
    updateContact,
    deleteContact,
    listCalendars,
    getAvailableTimeSlots,
    getWorkingTimes,
    listServices,
    createService,
    updateService,
    deleteService,
    listServiceGroups,
    createVoucher,
    listVouchers,
    getCompanyInfo,
  ],
  triggers: [
    appointmentEvent,
  ],
});
