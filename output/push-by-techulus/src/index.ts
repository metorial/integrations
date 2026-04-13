import { Slate } from 'slates';
import { spec } from './spec';
import { sendNotification, sendGroupNotification, inviteTeamMember, removeTeamMember } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [sendNotification, sendGroupNotification, inviteTeamMember, removeTeamMember],
  triggers: [
    inboundWebhook,
  ],
});
