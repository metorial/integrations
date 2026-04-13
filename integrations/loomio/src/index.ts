import { Slate } from 'slates';
import { spec } from './spec';
import {
  createDiscussion,
  getDiscussion,
  listDiscussions,
  createPoll,
  getPoll,
  listPolls,
  manageMemberships
} from './tools';
import { newDiscussions, newPolls, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createDiscussion,
    getDiscussion,
    listDiscussions,
    createPoll,
    getPoll,
    listPolls,
    manageMemberships
  ],
  triggers: [inboundWebhook, newDiscussions, newPolls]
});
