import { Slate } from 'slates';
import { spec } from './spec';
import {
  listStoresTool,
  listProductsTool,
  listVariantsTool,
  getOrderTool,
  listOrdersTool,
  refundOrderTool,
  createCheckoutTool,
  manageSubscriptionTool,
  listSubscriptionsTool,
  createDiscountTool,
  listDiscountsTool,
  listCustomersTool,
  manageLicenseKeyTool,
  listLicenseKeysTool,
} from './tools';
import {
  orderEventsTrigger,
  subscriptionEventsTrigger,
  subscriptionPaymentEventsTrigger,
  licenseKeyEventsTrigger,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listStoresTool,
    listProductsTool,
    listVariantsTool,
    getOrderTool,
    listOrdersTool,
    refundOrderTool,
    createCheckoutTool,
    manageSubscriptionTool,
    listSubscriptionsTool,
    createDiscountTool,
    listDiscountsTool,
    listCustomersTool,
    manageLicenseKeyTool,
    listLicenseKeysTool,
  ],
  triggers: [
    orderEventsTrigger,
    subscriptionEventsTrigger,
    subscriptionPaymentEventsTrigger,
    licenseKeyEventsTrigger,
  ],
});
