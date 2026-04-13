import { Slate } from 'slates';
import { spec } from './spec';
import {
  managePrompt,
  callPrompt,
  manageDataset,
  manageEvaluator,
  runEvaluation,
  manageFlow,
  manageTool,
  manageLogs,
  logPromptResult,
  deployPrompt,
  manageDirectory
} from './tools';
import { newLogs, newEvaluations, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    managePrompt,
    callPrompt,
    manageDataset,
    manageEvaluator,
    runEvaluation,
    manageFlow,
    manageTool,
    manageLogs,
    logPromptResult,
    deployPrompt,
    manageDirectory
  ],
  triggers: [inboundWebhook, newLogs, newEvaluations]
});
