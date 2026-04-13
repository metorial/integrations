import { Slate } from 'slates';
import { spec } from './spec';
import {
  createPerson,
  updatePerson,
  getPerson,
  deletePerson,
  listPeople,
  createAccount,
  updateAccount,
  getAccount,
  deleteAccount,
  listAccounts,
  listCadences,
  getCadence,
  addPersonToCadence,
  removePersonFromCadence,
  listEmailActivities,
  listCallActivities,
  logCall,
  createNote,
  updateNote,
  listNotes,
  listEmailTemplates,
  getEmailTemplate,
  listTasks,
  getTask,
  listUsers,
  getMe
} from './tools';
import {
  personEvents,
  accountEvents,
  cadenceEvents,
  callEvents,
  meetingEvents,
  noteEvents,
  taskEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createPerson,
    updatePerson,
    getPerson,
    deletePerson,
    listPeople,
    createAccount,
    updateAccount,
    getAccount,
    deleteAccount,
    listAccounts,
    listCadences,
    getCadence,
    addPersonToCadence,
    removePersonFromCadence,
    listEmailActivities,
    listCallActivities,
    logCall,
    createNote,
    updateNote,
    listNotes,
    listEmailTemplates,
    getEmailTemplate,
    listTasks,
    getTask,
    listUsers,
    getMe
  ],
  triggers: [
    personEvents,
    accountEvents,
    cadenceEvents,
    callEvents,
    meetingEvents,
    noteEvents,
    taskEvents
  ]
});
