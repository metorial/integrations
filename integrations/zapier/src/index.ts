import { Slate } from 'slates';
import { spec } from './spec';
import {
  listApps,
  listZaps,
  createZap,
  listActions,
  getActionInputFields,
  getActionOutputFields,
  getInputFieldChoices,
  testActionStep,
  createActionRun,
  getActionRun,
  listAuthentications,
  createAuthentication,
  getZapTemplates,
  listCategories,
  getZapRuns,
  createWorkflowStep
} from './tools';
import { zapRunActivity, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listApps,
    listZaps,
    createZap,
    listActions,
    getActionInputFields,
    getActionOutputFields,
    getInputFieldChoices,
    testActionStep,
    createActionRun,
    getActionRun,
    listAuthentications,
    createAuthentication,
    getZapTemplates,
    listCategories,
    getZapRuns,
    createWorkflowStep
  ],
  triggers: [inboundWebhook, zapRunActivity]
});
