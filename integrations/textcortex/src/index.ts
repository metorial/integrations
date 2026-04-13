import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateText,
  generateBlog,
  generateProductDescription,
  generateAdCopy,
  generateEmail,
  generateSocialMediaPost,
  rewriteText,
  summarizeText,
  translateText,
  generateCode
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    generateText,
    generateBlog,
    generateProductDescription,
    generateAdCopy,
    generateEmail,
    generateSocialMediaPost,
    rewriteText,
    summarizeText,
    translateText,
    generateCode
  ],
  triggers: [inboundWebhook]
});
