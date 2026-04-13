import { Slate } from 'slates';
import { spec } from './spec';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listCoupons,
  verifyLicenseKey,
  redeemLicenseKey,
  refundLicenseKey,
  verifySubscription,
  getAccount,
} from './tools';
import {
  newSaleTrigger,
  newLeadTrigger,
  newAffiliateTrigger,
  newSubscriptionTrigger,
  subscriptionCancellationTrigger,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createProduct,
    updateProduct,
    deleteProduct,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    listCoupons,
    verifyLicenseKey,
    redeemLicenseKey,
    refundLicenseKey,
    verifySubscription,
    getAccount,
  ],
  triggers: [
    newSaleTrigger,
    newLeadTrigger,
    newAffiliateTrigger,
    newSubscriptionTrigger,
    subscriptionCancellationTrigger,
  ],
});
