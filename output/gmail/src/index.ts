import {
  Slate } from 'slates';
import { spec } from './spec';
import { sendEmail, searchMessages, getMessage, modifyMessage, manageDraft, manageLabels, manageThread, manageSettings, getAttachment } from './tools';
import { mailboxChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [sendEmail.build(), searchMessages.build(), getMessage.build(), modifyMessage.build(), manageDraft.build(), manageLabels.build(), manageThread.build(), manageSettings.build(), getAttachment.build()],
  triggers: [
    inboundWebhook,mailboxChanges.build()],
});
