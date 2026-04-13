import { Slate } from 'slates';
import { spec } from './spec';
import {
  listNotebooksTool,
  createNotebookTool,
  updateNotebookTool,
  createNoteTool,
  getNoteTool,
  getNoteContentTool,
  updateNoteTool,
  deleteNoteTool,
  searchNotesTool,
  listTagsTool,
  manageTagTool,
  copyNoteTool
} from './tools';
import { noteChangesTrigger, noteUpdatesPollTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listNotebooksTool,
    createNotebookTool,
    updateNotebookTool,
    createNoteTool,
    getNoteTool,
    getNoteContentTool,
    updateNoteTool,
    deleteNoteTool,
    searchNotesTool,
    listTagsTool,
    manageTagTool,
    copyNoteTool
  ],
  triggers: [noteChangesTrigger, noteUpdatesPollTrigger]
});
