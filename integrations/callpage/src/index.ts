import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCalls,
  getCall,
  updateCallField,
  initiateCall,
  listWidgets,
  getWidget,
  createWidget,
  updateWidget,
  deleteWidget,
  addUsersToWidget,
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  listManagers,
  createManager,
  updateManager,
  deleteManager,
  listSmsTemplates,
  upsertSmsTemplate,
  resetSmsTemplate,
  listVoiceMessages,
  upsertVoiceMessage,
  resetVoiceMessage
} from './tools';
import { callEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCalls,
    getCall,
    updateCallField,
    initiateCall,
    listWidgets,
    getWidget,
    createWidget,
    updateWidget,
    deleteWidget,
    addUsersToWidget,
    listUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    listManagers,
    createManager,
    updateManager,
    deleteManager,
    listSmsTemplates,
    upsertSmsTemplate,
    resetSmsTemplate,
    listVoiceMessages,
    upsertVoiceMessage,
    resetVoiceMessage
  ],
  triggers: [
    callEvents
  ]
});
