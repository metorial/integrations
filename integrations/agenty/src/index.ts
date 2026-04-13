import { Slate } from 'slates';
import { spec } from './spec';
import {
  listAgents,
  getAgent,
  cloneAgent,
  deleteAgent,
  startJob,
  stopJob,
  getJobStatus,
  getJobResults,
  getJobLogs,
  listJobs,
  exportJobResult,
  manageAgentInput,
  manageSchedule,
  manageList,
  captureScreenshot,
  generatePdf,
  getPageContent,
  extractStructuredData
} from './tools';
import { jobCompleted, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listAgents,
    getAgent,
    cloneAgent,
    deleteAgent,
    startJob,
    stopJob,
    getJobStatus,
    getJobResults,
    getJobLogs,
    listJobs,
    exportJobResult,
    manageAgentInput,
    manageSchedule,
    manageList,
    captureScreenshot,
    generatePdf,
    getPageContent,
    extractStructuredData
  ],
  triggers: [inboundWebhook, jobCompleted]
});
