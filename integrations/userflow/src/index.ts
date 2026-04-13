import { Slate } from 'slates';
import { spec } from './spec';
import {
  createOrUpdateUser,
  getUser,
  listUsers,
  deleteUser,
  createOrUpdateGroup,
  getGroup,
  listGroups,
  deleteGroup,
  removeGroupMembership,
  trackEvent,
  listEventDefinitions,
  listContent,
  getContent,
  manageWebhookSubscription
} from './tools';
import { userEvents, groupEvents, eventTracked } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createOrUpdateUser,
    getUser,
    listUsers,
    deleteUser,
    createOrUpdateGroup,
    getGroup,
    listGroups,
    deleteGroup,
    removeGroupMembership,
    trackEvent,
    listEventDefinitions,
    listContent,
    getContent,
    manageWebhookSubscription
  ],
  triggers: [userEvents, groupEvents, eventTracked]
});
