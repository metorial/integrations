import { Slate } from 'slates';
import { spec } from './spec';
import {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  manageContactIdentifiers,
  awardCredits,
  listLoyaltyTransactions,
  listRewards,
  claimReward,
  manageVouchers,
  manageGiftcards,
  managePrepaid,
  listShops,
  listPromotions,
  getLoyaltyProgram,
  triggerAutomation,
} from './tools';
import {
  contactEvents,
  loyaltyEvents,
  financialEvents,
  voucherEvents,
  engagementEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
    manageContactIdentifiers,
    awardCredits,
    listLoyaltyTransactions,
    listRewards,
    claimReward,
    manageVouchers,
    manageGiftcards,
    managePrepaid,
    listShops,
    listPromotions,
    getLoyaltyProgram,
    triggerAutomation,
  ],
  triggers: [
    contactEvents,
    loyaltyEvents,
    financialEvents,
    voucherEvents,
    engagementEvents,
  ],
});
