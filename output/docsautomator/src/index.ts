import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateDocument,
  getJobStatus,
  getQueueStats,
  listAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  duplicateAutomation,
  listPlaceholders,
  duplicateTemplate,
  listEsignSessions,
  getEsignSession,
  cancelEsignSession,
  resendEsignInvitation,
} from './tools';
import {
  esignEvent,
  documentGenerated,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    generateDocument,
    getJobStatus,
    getQueueStats,
    listAutomations,
    getAutomation,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    duplicateAutomation,
    listPlaceholders,
    duplicateTemplate,
    listEsignSessions,
    getEsignSession,
    cancelEsignSession,
    resendEsignInvitation,
  ],
  triggers: [
    esignEvent,
    documentGenerated,
  ],
});
