import { Slate } from 'slates';
import { spec } from './spec';
import {
  listUsers,
  createUser,
  updateUser,
  getCustomFields,
  manageTimeClock,
  manageTimeOff,
  manageScheduler,
  manageJobs,
  manageForms,
  manageTasks,
  sendChatMessage,
  listConversations,
  manageOnboarding,
} from './tools';
import {
  userEvents,
  timeActivityEvents,
  formSubmissionEvents,
  schedulerEvents,
  taskEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listUsers,
    createUser,
    updateUser,
    getCustomFields,
    manageTimeClock,
    manageTimeOff,
    manageScheduler,
    manageJobs,
    manageForms,
    manageTasks,
    sendChatMessage,
    listConversations,
    manageOnboarding,
  ],
  triggers: [
    userEvents,
    timeActivityEvents,
    formSubmissionEvents,
    schedulerEvents,
    taskEvents,
  ],
});
