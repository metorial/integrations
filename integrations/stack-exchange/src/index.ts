import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  searchQuestions,
  getQuestion,
  getAnswers,
  getUser,
  getUserActivity,
  browseTags,
  getInbox,
  manageComment,
  postQuestion,
  postAnswer,
  getPostRevisions,
  listSites,
} from './tools';
import {
  newQuestions,
  newAnswers,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchQuestions,
    getQuestion,
    getAnswers,
    getUser,
    getUserActivity,
    browseTags,
    getInbox,
    manageComment,
    postQuestion,
    postAnswer,
    getPostRevisions,
    listSites,
  ],
  triggers: [
    inboundWebhook,
    newQuestions,
    newAnswers,
  ],
});
