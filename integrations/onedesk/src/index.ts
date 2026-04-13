import {
  Slate } from 'slates';
import { spec } from './spec';
import { createItem, updateItem, getItem, searchItems, createProject, searchProjects, createMessage, createUser, getOrganization } from './tools';
import { itemEvents, projectEvents, userCreated,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createItem,
    updateItem,
    getItem,
    searchItems,
    createProject,
    searchProjects,
    createMessage,
    createUser,
    getOrganization,
  ],
  triggers: [
    inboundWebhook,
    itemEvents,
    projectEvents,
    userCreated,
  ],
});
