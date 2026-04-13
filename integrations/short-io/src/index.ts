import { Slate } from 'slates';
import { spec } from './spec';
import {
  createLink,
  updateLink,
  deleteLink,
  getLink,
  listLinks,
  listDomains,
  getLinkStatistics,
  getDomainStatistics,
  generateQrCode,
  archiveLink
} from './tools';
import { newLink, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createLink,
    updateLink,
    deleteLink,
    getLink,
    listLinks,
    listDomains,
    getLinkStatistics,
    getDomainStatistics,
    generateQrCode,
    archiveLink
  ],
  triggers: [inboundWebhook, newLink]
});
