import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjects, getProject, createProject, updateProject, deleteProject, getProjectReport,
  listActivities, createActivity, updateActivity, deleteActivity, manageTimer,
  listCompanies, getCompany, createCompany, updateCompany, deleteCompany,
  listContacts, getContact, createContact, updateContact, deleteContact,
  listDeals, getDeal, createDeal, updateDeal, deleteDeal,
  listInvoices, getInvoice, createInvoice, updateInvoiceStatus, deleteInvoice,
  listOffers, getOffer, createOffer, updateOfferStatus,
  listPurchases, getPurchase, createPurchase, deletePurchase,
  listUsers, getUser,
  listProjectTasks, createProjectTask, updateProjectTask, deleteProjectTask,
  listPlanningEntries, createPlanningEntry, updatePlanningEntry, deletePlanningEntry,
  listComments, createComment, deleteComment,
  listPresences, clockInOut, createPresence,
  listProjectExpenses, createProjectExpense, deleteProjectExpense
} from './tools';
import {
  activityEvents,
  projectEvents,
  companyEvents,
  contactEvents,
  invoiceEvents,
  offerEvents,
  dealEvents,
  expenseEvents,
  purchaseEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProjects, getProject, createProject, updateProject, deleteProject, getProjectReport,
    listActivities, createActivity, updateActivity, deleteActivity, manageTimer,
    listCompanies, getCompany, createCompany, updateCompany, deleteCompany,
    listContacts, getContact, createContact, updateContact, deleteContact,
    listDeals, getDeal, createDeal, updateDeal, deleteDeal,
    listInvoices, getInvoice, createInvoice, updateInvoiceStatus, deleteInvoice,
    listOffers, getOffer, createOffer, updateOfferStatus,
    listPurchases, getPurchase, createPurchase, deletePurchase,
    listUsers, getUser,
    listProjectTasks, createProjectTask, updateProjectTask, deleteProjectTask,
    listPlanningEntries, createPlanningEntry, updatePlanningEntry, deletePlanningEntry,
    listComments, createComment, deleteComment,
    listPresences, clockInOut, createPresence,
    listProjectExpenses, createProjectExpense, deleteProjectExpense
  ],
  triggers: [
    activityEvents,
    projectEvents,
    companyEvents,
    contactEvents,
    invoiceEvents,
    offerEvents,
    dealEvents,
    expenseEvents,
    purchaseEvents
  ]
});
