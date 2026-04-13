import { Slate } from 'slates';
import { spec } from './spec';
import {
  listBooleanVariables,
  updateBooleanVariable,
  listStringVariables,
  updateStringVariable,
  listNumericVariables,
  updateNumericVariable,
  getVariable,
  listConditions,
  getCondition,
  listLogicblocks,
  evaluateLogicblock,
  manageLogicblock,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listBooleanVariables,
    updateBooleanVariable,
    listStringVariables,
    updateStringVariable,
    listNumericVariables,
    updateNumericVariable,
    getVariable,
    listConditions,
    getCondition,
    listLogicblocks,
    evaluateLogicblock,
    manageLogicblock,
  ],
  triggers: [
    inboundWebhook,
  ],
});
