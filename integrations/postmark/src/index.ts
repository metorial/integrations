import { Slate } from 'slates';
import { spec } from './spec';
import { sendEmail, sendTemplateEmail, searchMessages, getBounces, manageSuppressions, getStatistics, manageTemplates, manageMessageStreams, getServer, manageWebhooks } from './tools';
import { outboundEvents, inboundEmail } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [sendEmail.build(), sendTemplateEmail.build(), searchMessages.build(), getBounces.build(), manageSuppressions.build(), getStatistics.build(), manageTemplates.build(), manageMessageStreams.build(), getServer.build(), manageWebhooks.build()],
  triggers: [outboundEvents.build(), inboundEmail.build()],
});
