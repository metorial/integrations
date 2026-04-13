import { Slate } from 'slates';
import { spec } from './spec';
import {
  listJobs,
  getJob,
  updateJob,
  stopJob,
  deleteJob,
  listBuilds,
  getBuild,
  listDevices,
  getDeviceStatus,
  listTunnels,
  stopTunnel,
  getPlatformStatus,
  listSupportedPlatforms,
  listUsers,
  listTeams,
  getUserConcurrency,
  listStorageFiles
} from './tools';
import { testJobEvents, visualTestingEvents, jobMonitor } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listJobs,
    getJob,
    updateJob,
    stopJob,
    deleteJob,
    listBuilds,
    getBuild,
    listDevices,
    getDeviceStatus,
    listTunnels,
    stopTunnel,
    getPlatformStatus,
    listSupportedPlatforms,
    listUsers,
    listTeams,
    getUserConcurrency,
    listStorageFiles
  ],
  triggers: [testJobEvents, visualTestingEvents, jobMonitor]
});
