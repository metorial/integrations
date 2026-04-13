import { Slate } from 'slates';
import { spec } from './spec';
import {
  listVms,
  getVm,
  createVm,
  manageVm,
  deleteVm,
  manageSnapshots,
  manageBlockStorage,
  manageObjectStorage,
  manageS3Keys,
  manageNetworks,
  manageFloatingIps,
  manageFirewalls,
  manageLoadBalancers,
  manageSshKeys,
  listPlatformConfig,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listVms,
    getVm,
    createVm,
    manageVm,
    deleteVm,
    manageSnapshots,
    manageBlockStorage,
    manageObjectStorage,
    manageS3Keys,
    manageNetworks,
    manageFloatingIps,
    manageFirewalls,
    manageLoadBalancers,
    manageSshKeys,
    listPlatformConfig,
  ],
  triggers: [
    inboundWebhook,
  ],
});
