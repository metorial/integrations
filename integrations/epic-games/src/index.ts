import { Slate } from 'slates';
import { spec } from './spec';
import {
  lookupProductUser,
  getAccountInfo,
  getFriends,
  manageSanctions,
  querySanctions,
  sendPlayerReport,
  findPlayerReports,
  checkOwnership,
  getEntitlements,
  redeemEntitlements,
  manageVoiceRoom,
  getAntiCheatStatus
} from './tools';
import { sanctionsSync, playerReportsPoll, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    lookupProductUser,
    getAccountInfo,
    getFriends,
    manageSanctions,
    querySanctions,
    sendPlayerReport,
    findPlayerReports,
    checkOwnership,
    getEntitlements,
    redeemEntitlements,
    manageVoiceRoom,
    getAntiCheatStatus
  ],
  triggers: [inboundWebhook, sanctionsSync, playerReportsPoll]
});
