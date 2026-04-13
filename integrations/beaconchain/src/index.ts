import { Slate } from 'slates';
import { spec } from './spec';
import {
  getNetworkState,
  getValidatorInfo,
  getValidatorRewards,
  getValidatorPerformance,
  getValidatorDuties,
  manageDashboardValidators,
  getSlotDetails,
  getBlockDetails,
  getExecutionAddress,
  getStakingEntities,
  getSyncCommittee
} from './tools';
import { validatorEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getNetworkState,
    getValidatorInfo,
    getValidatorRewards,
    getValidatorPerformance,
    getValidatorDuties,
    manageDashboardValidators,
    getSlotDetails,
    getBlockDetails,
    getExecutionAddress,
    getStakingEntities,
    getSyncCommittee
  ],
  triggers: [validatorEvents]
});
