import { Slate } from 'slates';
import { spec } from './spec';
import { shortenUrl, getUrl, updateUrl, getUserSettings } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [shortenUrl, getUrl, updateUrl, getUserSettings],
  triggers: [inboundWebhook]
});
