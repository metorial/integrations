import { Slate } from 'slates';
import { spec } from './spec';
import { verifyEmail, verifyBatch, getBatchStatus, getAccount } from './tools';
import { batchCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [verifyEmail, verifyBatch, getBatchStatus, getAccount],
  triggers: [batchCompleted]
});
