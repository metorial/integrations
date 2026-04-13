import { Slate } from 'slates';
import { spec } from './spec';
import {
  listGroupsAndLinks,
  getExamResults,
  listCategories,
  manageCategory,
  getQuestions,
  createOrUpdateQuestion,
  manageAccessList
} from './tools';
import { examResultsCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listGroupsAndLinks,
    getExamResults,
    listCategories,
    manageCategory,
    getQuestions,
    createOrUpdateQuestion,
    manageAccessList
  ],
  triggers: [examResultsCompleted]
});
