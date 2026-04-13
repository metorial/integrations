import { Slate } from 'slates';
import { spec } from './spec';
import {
  scrapeWebsite,
  createScrapeTask,
  getScrapeTaskResults,
  listSubUsers,
  createSubUser,
  updateSubUser,
  deleteSubUser,
  getSubUserTraffic,
  listWhitelistedIps,
  addWhitelistedIps,
  removeWhitelistedIp,
  getSubscriptions,
  getProxyEndpoints
} from './tools';
import { accountEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    scrapeWebsite,
    createScrapeTask,
    getScrapeTaskResults,
    listSubUsers,
    createSubUser,
    updateSubUser,
    deleteSubUser,
    getSubUserTraffic,
    listWhitelistedIps,
    addWhitelistedIps,
    removeWhitelistedIp,
    getSubscriptions,
    getProxyEndpoints
  ],
  triggers: [accountEvents]
});
