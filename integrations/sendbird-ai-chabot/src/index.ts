import { Slate } from 'slates';
import { spec } from './spec';
import {
  createBot,
  updateBot,
  listBots,
  getBot,
  deleteBot,
  sendBotMessage,
  generateAiReply,
  manageBotChannels,
  manageTypingIndicator
} from './tools';
import { messageEvents, channelEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createBot,
    updateBot,
    listBots,
    getBot,
    deleteBot,
    sendBotMessage,
    generateAiReply,
    manageBotChannels,
    manageTypingIndicator
  ],
  triggers: [messageEvents, channelEvents]
});
