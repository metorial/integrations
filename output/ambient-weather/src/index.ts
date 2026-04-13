import {
  Slate } from 'slates';
import { spec } from './spec';
import { listDevices, getDeviceData, getCurrentWeather } from './tools';
import { weatherDataUpdated,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listDevices, getDeviceData, getCurrentWeather],
  triggers: [
    inboundWebhook,weatherDataUpdated],
});
