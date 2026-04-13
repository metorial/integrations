import { Slate } from 'slates';
import { spec } from './spec';
import { listEvents, getEvent, listOrders, getOrder, listTickets, listTags } from './tools';
import { newOrders, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listEvents, getEvent, listOrders, getOrder, listTickets, listTags],
  triggers: [inboundWebhook, newOrders]
});
