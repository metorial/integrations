import { Slate } from 'slates';
import { spec } from './spec';
import {
  crmGetRecords,
  crmManageRecord,
  crmSearchRecords,
  crmGetModules,
  deskGetTickets,
  deskManageTicket,
  booksGetInvoices,
  booksManageInvoice,
  booksManageContact,
  booksManageExpense,
  peopleManageEmployee,
  projectsManageProject,
  projectsManageTask,
} from './tools';
import {
  crmRecordEvents,
  deskEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    crmGetRecords,
    crmManageRecord,
    crmSearchRecords,
    crmGetModules,
    deskGetTickets,
    deskManageTicket,
    booksGetInvoices,
    booksManageInvoice,
    booksManageContact,
    booksManageExpense,
    peopleManageEmployee,
    projectsManageProject,
    projectsManageTask,
  ],
  triggers: [
    crmRecordEvents,
    deskEvents,
  ],
});
