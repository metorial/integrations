import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listDevices,
  getDeviceStatus,
  restartDevice,
  digitalWrite,
  digitalRead,
  analogRead,
  analogWrite,
  servoControl,
  uartCommunicate
} from './tools';
import {
  deviceStatusChange,
  analogSensorReading,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listDevices,
    getDeviceStatus,
    restartDevice,
    digitalWrite,
    digitalRead,
    analogRead,
    analogWrite,
    servoControl,
    uartCommunicate
  ],
  triggers: [
    inboundWebhook,
    deviceStatusChange,
    analogSensorReading
  ]
});
