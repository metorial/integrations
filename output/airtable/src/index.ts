import { Slate } from 'slates';
import { spec } from './spec';
import {
  listRecordsTool,
  getRecordTool,
  createRecordsTool,
  updateRecordsTool,
  deleteRecordsTool,
  upsertRecordsTool,
  getBaseSchemaTool,
  manageTableTool,
  manageFieldTool,
  manageCommentTool,
  listBasesTool,
} from './tools';
import { baseChangesTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listRecordsTool,
    getRecordTool,
    createRecordsTool,
    updateRecordsTool,
    deleteRecordsTool,
    upsertRecordsTool,
    getBaseSchemaTool,
    manageTableTool,
    manageFieldTool,
    manageCommentTool,
    listBasesTool,
  ],
  triggers: [
    baseChangesTrigger,
  ],
});
