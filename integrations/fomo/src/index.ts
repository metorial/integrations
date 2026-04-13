import { Slate } from 'slates';
import { spec } from './spec';
import {
  createEvent,
  getEvent,
  listEvents,
  searchEvent,
  updateEvent,
  deleteEvent,
  createTemplate,
  getStatistics,
  updateApplication,
  getOpenMetrics
} from './tools';
import { newEvent, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createEvent,
    getEvent,
    listEvents,
    searchEvent,
    updateEvent,
    deleteEvent,
    createTemplate,
    getStatistics,
    updateApplication,
    getOpenMetrics
  ],
  triggers: [inboundWebhook, newEvent]
});
