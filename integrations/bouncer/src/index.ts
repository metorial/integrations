import { Slate } from 'slates';
import { spec } from './spec';
import {
  verifyEmail,
  batchVerifyEmails,
  createBatchVerification,
  getBatchStatus,
  getBatchResults,
  verifyDomain,
  checkToxicity,
  getToxicityStatus,
  getToxicityResults,
  checkCredits
} from './tools';
import { batchCompleted, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    verifyEmail,
    batchVerifyEmails,
    createBatchVerification,
    getBatchStatus,
    getBatchResults,
    verifyDomain,
    checkToxicity,
    getToxicityStatus,
    getToxicityResults,
    checkCredits
  ],
  triggers: [inboundWebhook, batchCompleted]
});
