import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageContact,
  searchContacts,
  deleteContact,
  sendEvent,
  manageTask,
  manageNote,
  logCall,
  sendTextMessage,
  manageDeal,
  manageAppointment,
  listUsers,
  listDeals,
  listTasks,
  enrollActionPlan,
  listPipelines
} from './tools';
import {
  peopleEvents,
  communicationEvents,
  taskEvents,
  dealEvents,
  appointmentEvents,
  noteEvents,
  emailMarketingEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageContact,
    searchContacts,
    deleteContact,
    sendEvent,
    manageTask,
    manageNote,
    logCall,
    sendTextMessage,
    manageDeal,
    manageAppointment,
    listUsers,
    listDeals,
    listTasks,
    enrollActionPlan,
    listPipelines
  ],
  triggers: [
    peopleEvents,
    communicationEvents,
    taskEvents,
    dealEvents,
    appointmentEvents,
    noteEvents,
    emailMarketingEvents
  ]
});
