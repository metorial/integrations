import { Slate } from 'slates';
import { spec } from './spec';
import { runLookup, listMonitors, createMonitor, deleteMonitor, getUsage } from './tools';
import { monitorStatusChanged, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [runLookup, listMonitors, createMonitor, deleteMonitor, getUsage],
  triggers: [inboundWebhook, monitorStatusChanged]
});
