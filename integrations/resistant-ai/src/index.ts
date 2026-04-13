import { Slate } from 'slates';
import { spec } from './spec';
import {
  requestIdentityVerification,
  getVerification,
  listVerifications,
  manageVerification,
  runAmlScreening,
  getAmlScreening,
  requestProofOfAddress,
  requestBackgroundCheck,
  requestCreditCheck,
  requestKybReport,
  getKybReport
} from './tools';
import { verificationCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    requestIdentityVerification,
    getVerification,
    listVerifications,
    manageVerification,
    runAmlScreening,
    getAmlScreening,
    requestProofOfAddress,
    requestBackgroundCheck,
    requestCreditCheck,
    requestKybReport,
    getKybReport
  ],
  triggers: [verificationCompleted]
});
