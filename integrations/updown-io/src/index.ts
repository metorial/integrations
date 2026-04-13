import { Slate } from 'slates';
import { spec } from './spec';
import {
  listChecks,
  getCheck,
  createCheck,
  updateCheck,
  deleteCheck,
  getDowntimes,
  getMetrics,
  listRecipients,
  createRecipient,
  deleteRecipient,
  listStatusPages,
  createStatusPage,
  updateStatusPage,
  deleteStatusPage,
  listNodes,
} from './tools';
import { monitoringEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listChecks,
    getCheck,
    createCheck,
    updateCheck,
    deleteCheck,
    getDowntimes,
    getMetrics,
    listRecipients,
    createRecipient,
    deleteRecipient,
    listStatusPages,
    createStatusPage,
    updateStatusPage,
    deleteStatusPage,
    listNodes,
  ],
  triggers: [
    monitoringEvents,
  ],
});
