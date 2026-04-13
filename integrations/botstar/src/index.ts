import { Slate } from 'slates';
import { spec } from './spec';
import {
  listBots,
  getBot,
  getUser,
  updateUser,
  createUserAttribute,
  broadcastMessage,
  sendMessage,
  listCmsEntities,
  manageCmsEntity,
  listCmsItems,
  manageCmsItem,
  manageBotAttributes,
  publishBot
} from './tools';
import { userEvent, chatbotEvent, cmsEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listBots,
    getBot,
    getUser,
    updateUser,
    createUserAttribute,
    broadcastMessage,
    sendMessage,
    listCmsEntities,
    manageCmsEntity,
    listCmsItems,
    manageCmsItem,
    manageBotAttributes,
    publishBot
  ],
  triggers: [userEvent, chatbotEvent, cmsEvent]
});
