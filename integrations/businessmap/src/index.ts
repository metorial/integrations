import { Slate } from 'slates';
import { spec } from './spec';
import {
  listBoardsTool,
  getBoardTool,
  listCardsTool,
  getCardTool,
  createCardTool,
  updateCardTool,
  deleteCardTool,
  archiveCardTool,
  manageCommentsTool,
  manageSubtasksTool,
  manageCardLinksTool,
  manageCustomFieldsTool,
  listUsersTool,
  listWorkspacesTool,
  logTimeTool,
  blockCardTool
} from './tools';
import {
  cardEventsTrigger,
  subtaskEventsTrigger,
  commentEventsTrigger,
  boardEventsTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listWorkspacesTool,
    listBoardsTool,
    getBoardTool,
    listCardsTool,
    getCardTool,
    createCardTool,
    updateCardTool,
    deleteCardTool,
    archiveCardTool,
    manageCommentsTool,
    manageSubtasksTool,
    manageCardLinksTool,
    manageCustomFieldsTool,
    listUsersTool,
    logTimeTool,
    blockCardTool
  ],
  triggers: [cardEventsTrigger, subtaskEventsTrigger, commentEventsTrigger, boardEventsTrigger]
});
