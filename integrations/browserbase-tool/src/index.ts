import { Slate } from 'slates';
import { spec } from './spec';
import {
  createSession,
  listSessions,
  getSession,
  completeSession,
  getSessionDebugInfo,
  getSessionLogs,
  getSessionRecording,
  createContext,
  getContext,
  deleteContext,
  getExtension,
  deleteExtension,
  listProjects,
  getProjectUsage,
  fetchPage
} from './tools';
import { sessionStatusChange, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createSession,
    listSessions,
    getSession,
    completeSession,
    getSessionDebugInfo,
    getSessionLogs,
    getSessionRecording,
    createContext,
    getContext,
    deleteContext,
    getExtension,
    deleteExtension,
    listProjects,
    getProjectUsage,
    fetchPage
  ],
  triggers: [inboundWebhook, sessionStatusChange]
});
