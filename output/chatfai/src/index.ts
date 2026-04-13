import { Slate } from 'slates';
import { spec } from './spec';
import { searchCharacters, getCharacter, sendMessage } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [searchCharacters, getCharacter, sendMessage],
  triggers: [
    inboundWebhook,
  ],
});
