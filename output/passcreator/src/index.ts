import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  copyTemplate,
  publishTemplate,
  createPass,
  getPass,
  listPasses,
  updatePass,
  deletePass,
  bulkUpdatePasses,
  sendPass,
  sendPushNotification,
  manageBundle,
  getPassStatistics,
  manageAppScan,
} from './tools';
import {
  passEvents,
  templateEvents,
  scanEvents,
  messageEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    copyTemplate,
    publishTemplate,
    createPass,
    getPass,
    listPasses,
    updatePass,
    deletePass,
    bulkUpdatePasses,
    sendPass,
    sendPushNotification,
    manageBundle,
    getPassStatistics,
    manageAppScan,
  ],
  triggers: [
    passEvents,
    templateEvents,
    scanEvents,
    messageEvents,
  ],
});
