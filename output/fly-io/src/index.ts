import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listApps,
  getApp,
  createApp,
  deleteApp,
  listMachines,
  getMachine,
  createMachine,
  updateMachine,
  controlMachine,
  deleteMachine,
  waitForMachine,
  manageMachineLease,
  manageMachineMetadata,
  listVolumes,
  createVolume,
  manageVolume,
  manageSecrets,
  manageCertificates,
  requestOidcToken,
} from './tools';
import {
  machineStateChanged,
  appMachinesChanged,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listApps,
    getApp,
    createApp,
    deleteApp,
    listMachines,
    getMachine,
    createMachine,
    updateMachine,
    controlMachine,
    deleteMachine,
    waitForMachine,
    manageMachineLease,
    manageMachineMetadata,
    listVolumes,
    createVolume,
    manageVolume,
    manageSecrets,
    manageCertificates,
    requestOidcToken,
  ],
  triggers: [
    inboundWebhook,
    machineStateChanged,
    appMachinesChanged,
  ],
});
