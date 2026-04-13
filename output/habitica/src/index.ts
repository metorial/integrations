import { Slate } from 'slates';
import { spec } from './spec';
import {
  createTask,
  listTasks,
  updateTask,
  deleteTask,
  scoreTask,
  getUserProfile,
  castSkill,
  manageGroup,
  sendMessage,
  manageChallenge,
  manageTags,
  manageQuest,
  manageInventory,
  getContent,
} from './tools';
import {
  taskActivity,
  groupChatReceived,
  userActivity,
  questActivity,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createTask,
    listTasks,
    updateTask,
    deleteTask,
    scoreTask,
    getUserProfile,
    castSkill,
    manageGroup,
    sendMessage,
    manageChallenge,
    manageTags,
    manageQuest,
    manageInventory,
    getContent,
  ],
  triggers: [
    taskActivity,
    groupChatReceived,
    userActivity,
    questActivity,
  ],
});
