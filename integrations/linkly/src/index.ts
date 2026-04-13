import { Slate } from 'slates';
import { spec } from './spec';
import {
  createLink,
  updateLink,
  getLink,
  listLinks,
  deleteLinks,
  getClickAnalytics,
  getClickCounters,
  manageWebhooks,
  listWorkspaces,
  listDomains
} from './tools';
import { linkClicked } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createLink,
    updateLink,
    getLink,
    listLinks,
    deleteLinks,
    getClickAnalytics,
    getClickCounters,
    manageWebhooks,
    listWorkspaces,
    listDomains
  ],
  triggers: [linkClicked]
});
