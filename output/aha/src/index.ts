import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listProducts,
  listFeatures,
  getFeature,
  manageFeature,
  listReleases,
  manageRelease,
  listEpics,
  manageEpic,
  listIdeas,
  manageIdea,
  manageGoal,
  manageInitiative,
  listGoalsAndInitiatives,
  manageComment,
  manageTodo,
  listUsers,
} from './tools';
import {
  featureChanges,
  ideaChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProducts,
    listFeatures,
    getFeature,
    manageFeature,
    listReleases,
    manageRelease,
    listEpics,
    manageEpic,
    listIdeas,
    manageIdea,
    manageGoal,
    manageInitiative,
    listGoalsAndInitiatives,
    manageComment,
    manageTodo,
    listUsers,
  ],
  triggers: [
    inboundWebhook,
    featureChanges,
    ideaChanges,
  ],
});
