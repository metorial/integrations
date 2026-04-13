import { Slate } from 'slates';
import { spec } from './spec';
import {
  managePullZone,
  purgeCache,
  manageStorageZone,
  manageStorageFiles,
  manageDnsZone,
  manageDnsRecord,
  manageVideoLibrary,
  manageVideo,
  manageCollection,
  getStatistics,
  getBilling,
} from './tools';
import { videoProcessing } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    managePullZone,
    purgeCache,
    manageStorageZone,
    manageStorageFiles,
    manageDnsZone,
    manageDnsRecord,
    manageVideoLibrary,
    manageVideo,
    manageCollection,
    getStatistics,
    getBilling,
  ],
  triggers: [
    videoProcessing,
  ],
});
