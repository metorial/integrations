import { Slate } from 'slates';
import { spec } from './spec';
import {
  listPrograms,
  listMembers,
  createMember,
  updateMember,
  removeMember,
  listReferrals,
  createReferral,
  updateReferral,
  removeReferral,
  createReferralAction,
  listRewards,
  createReward,
  issueReward,
  removeReward,
  getRewardRules,
  getPayouts,
  processPayout,
  manageEmailSubscriptions,
  sendInviteFeed,
  getMemberAccessUrls
} from './tools';
import {
  programEvents,
  memberEvents,
  referralEvents,
  rewardEvents,
  emailEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listPrograms,
    listMembers,
    createMember,
    updateMember,
    removeMember,
    listReferrals,
    createReferral,
    updateReferral,
    removeReferral,
    createReferralAction,
    listRewards,
    createReward,
    issueReward,
    removeReward,
    getRewardRules,
    getPayouts,
    processPayout,
    manageEmailSubscriptions,
    sendInviteFeed,
    getMemberAccessUrls
  ],
  triggers: [programEvents, memberEvents, referralEvents, rewardEvents, emailEvents]
});
