import { Slate } from 'slates';
import { spec } from './spec';
import {
  verifyEmail,
  enrichEmail,
  findEmail,
  domainSearch,
  uploadBulkFile,
  checkBulkStatus
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [verifyEmail, enrichEmail, findEmail, domainSearch, uploadBulkFile, checkBulkStatus],
  triggers: [inboundWebhook]
});
