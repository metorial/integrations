import { Slate } from 'slates';
import { spec } from './spec';
import {
  screenOrder,
  orderFeedback,
  getOrderResult,
  sendSmsVerification,
  verifyOtp
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [screenOrder, orderFeedback, getOrderResult, sendSmsVerification, verifyOtp],
  triggers: [inboundWebhook]
});
