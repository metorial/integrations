import { Slate } from 'slates';
import { spec } from './spec';
import {
  getBoards,
  manageBoard,
  getLists,
  manageList,
  getCards,
  getCard,
  manageCard,
  manageChecklist,
  manageLabels,
  addComment,
  manageCardMembers,
  search,
  getBoardMembers,
  addAttachment,
  getActivity,
} from './tools';
import {
  boardActivity,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getBoards,
    manageBoard,
    getLists,
    manageList,
    getCards,
    getCard,
    manageCard,
    manageChecklist,
    manageLabels,
    addComment,
    manageCardMembers,
    search,
    getBoardMembers,
    addAttachment,
    getActivity,
  ],
  triggers: [
    boardActivity,
  ],
});
