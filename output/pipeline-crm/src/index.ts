import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  createDeal,
  getDeal,
  listDeals,
  updateDeal,
  deleteDeal,
  createPerson,
  getPerson,
  listPeople,
  updatePerson,
  deletePerson,
  createCompany,
  getCompany,
  listCompanies,
  updateCompany,
  deleteCompany,
  createNote,
  listNotes,
  createCalendarEntry,
  listCalendarEntries,
  listUsers,
  listDealStages,
  listCustomFieldLabels
} from './tools';
import {
  dealChanges,
  personChanges,
  companyChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createDeal,
    getDeal,
    listDeals,
    updateDeal,
    deleteDeal,
    createPerson,
    getPerson,
    listPeople,
    updatePerson,
    deletePerson,
    createCompany,
    getCompany,
    listCompanies,
    updateCompany,
    deleteCompany,
    createNote,
    listNotes,
    createCalendarEntry,
    listCalendarEntries,
    listUsers,
    listDealStages,
    listCustomFieldLabels
  ],
  triggers: [
    inboundWebhook,
    dealChanges,
    personChanges,
    companyChanges
  ]
});
