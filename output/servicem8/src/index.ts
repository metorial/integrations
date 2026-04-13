import { Slate } from 'slates';
import { spec } from './spec';
import {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  listClients,
  getClient,
  createClient,
  updateClient,
  manageContact,
  listStaff,
  scheduleJob,
  manageJobMaterials,
  addNote,
  recordPayment,
  listJobActivities,
} from './tools';
import {
  jobEvents,
  clientEvents,
  staffEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    listClients,
    getClient,
    createClient,
    updateClient,
    manageContact,
    listStaff,
    scheduleJob,
    manageJobMaterials,
    addNote,
    recordPayment,
    listJobActivities,
  ],
  triggers: [
    jobEvents,
    clientEvents,
    staffEvents,
  ],
});
