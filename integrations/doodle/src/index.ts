import { Slate } from 'slates';
import { spec } from './spec';
import {
  createPollTool,
  getPollTool,
  listPollsTool,
  deletePollTool,
  participateInPollTool,
  removeParticipantTool,
  addCommentTool,
  getCommentsTool
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    createPollTool,
    getPollTool,
    listPollsTool,
    deletePollTool,
    participateInPollTool,
    removeParticipantTool,
    addCommentTool,
    getCommentsTool
  ],
  triggers: [
    inboundWebhook,
  ]
});
