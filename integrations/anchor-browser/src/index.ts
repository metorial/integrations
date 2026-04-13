import { Slate } from 'slates';
import { spec } from './spec';
import {
  createSession,
  listSessions,
  getSession,
  getActiveSessions,
  endSession,
  manageProfile,
  performWebTask,
  checkWebTaskStatus,
  fetchWebpage,
  screenshotWebpage,
  browserControl,
  manageExtension,
  manageBatch,
  signalEvent,
  manageRecording,
  manageApplication,
  manageIdentity,
  manageIntegration,
  manageAgent
} from './tools';
import { sessionStatusChange, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createSession,
    listSessions,
    getSession,
    getActiveSessions,
    endSession,
    manageProfile,
    performWebTask,
    checkWebTaskStatus,
    fetchWebpage,
    screenshotWebpage,
    browserControl,
    manageExtension,
    manageBatch,
    signalEvent,
    manageRecording,
    manageApplication,
    manageIdentity,
    manageIntegration,
    manageAgent
  ],
  triggers: [inboundWebhook, sessionStatusChange]
});
