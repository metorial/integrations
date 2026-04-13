import { Slate } from 'slates';
import { spec } from './spec';
import {
  getUser,
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  manageGoal,
  createDatapoint,
  listDatapoints,
  updateDatapoint,
  deleteDatapoint,
  createCharge
} from './tools';
import {
  goalDerailReminder,
  goalUpdated
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getUser,
    listGoals,
    getGoal,
    createGoal,
    updateGoal,
    manageGoal,
    createDatapoint,
    listDatapoints,
    updateDatapoint,
    deleteDatapoint,
    createCharge
  ],
  triggers: [
    goalDerailReminder,
    goalUpdated
  ]
});
