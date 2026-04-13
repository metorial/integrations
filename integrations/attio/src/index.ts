import { Slate } from 'slates';
import { spec } from './spec';
import {
  getRecordTool,
  createRecordTool,
  updateRecordTool,
  deleteRecordTool,
  queryRecordsTool,
  searchRecordsTool,
  listObjectsTool,
  listAttributesTool,
  getListsTool,
  addListEntryTool,
  updateListEntryTool,
  deleteListEntryTool,
  queryListEntriesTool,
  listNotesTool,
  createNoteTool,
  deleteNoteTool,
  listTasksTool,
  createTaskTool,
  updateTaskTool,
  deleteTaskTool,
  createCommentTool,
  getThreadTool,
  deleteCommentTool,
  listWorkspaceMembersTool
} from './tools';
import {
  recordEventsTrigger,
  listEntryEventsTrigger,
  noteEventsTrigger,
  taskEventsTrigger,
  commentEventsTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getRecordTool,
    createRecordTool,
    updateRecordTool,
    deleteRecordTool,
    queryRecordsTool,
    searchRecordsTool,
    listObjectsTool,
    listAttributesTool,
    getListsTool,
    addListEntryTool,
    updateListEntryTool,
    deleteListEntryTool,
    queryListEntriesTool,
    listNotesTool,
    createNoteTool,
    deleteNoteTool,
    listTasksTool,
    createTaskTool,
    updateTaskTool,
    deleteTaskTool,
    createCommentTool,
    getThreadTool,
    deleteCommentTool,
    listWorkspaceMembersTool
  ],
  triggers: [
    recordEventsTrigger,
    listEntryEventsTrigger,
    noteEventsTrigger,
    taskEventsTrigger,
    commentEventsTrigger
  ]
});
