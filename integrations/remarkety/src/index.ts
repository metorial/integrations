import { Slate } from 'slates';
import { spec } from './spec';
import {
  upsertCustomerTool,
  upsertOrderTool,
  manageProductTool,
  upsertCartTool,
  manageNewsletterTool,
  sendCustomEventTool,
  batchUploadContactsTool
} from './tools';
import {
  emailEventsTrigger,
  smsEventsTrigger,
  newsletterEventsTrigger,
  suppressionEventsTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    upsertCustomerTool,
    upsertOrderTool,
    manageProductTool,
    upsertCartTool,
    manageNewsletterTool,
    sendCustomEventTool,
    batchUploadContactsTool
  ],
  triggers: [
    emailEventsTrigger,
    smsEventsTrigger,
    newsletterEventsTrigger,
    suppressionEventsTrigger
  ]
});
