import { Slate } from 'slates';
import { spec } from './spec';
import {
  createBotTool,
  listBotsTool,
  getBotTool,
  updateBotTool,
  deleteBotTool,
  removeBotFromCallTool,
  getTranscriptTool,
  sendChatMessageTool,
  outputMediaTool,
  listCalendarsTool,
  listCalendarEventsTool,
  scheduleBotForEventTool
} from './tools';
import {
  botStatusChangeTrigger,
  recordingStatusChangeTrigger,
  calendarEventChangeTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createBotTool,
    listBotsTool,
    getBotTool,
    updateBotTool,
    deleteBotTool,
    removeBotFromCallTool,
    getTranscriptTool,
    sendChatMessageTool,
    outputMediaTool,
    listCalendarsTool,
    listCalendarEventsTool,
    scheduleBotForEventTool
  ],
  triggers: [botStatusChangeTrigger, recordingStatusChangeTrigger, calendarEventChangeTrigger]
});
