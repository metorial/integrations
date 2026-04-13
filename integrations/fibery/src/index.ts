import { Slate } from 'slates';
import { spec } from './spec';
import {
  getSchemaTool,
  queryEntitiesTool,
  createEntityTool,
  updateEntityTool,
  deleteEntityTool,
  manageDocumentTool,
  manageCollectionTool,
  uploadFileTool,
  batchCreateOrUpdateTool
} from './tools';
import { entityChangesTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getSchemaTool,
    queryEntitiesTool,
    createEntityTool,
    updateEntityTool,
    deleteEntityTool,
    manageDocumentTool,
    manageCollectionTool,
    uploadFileTool,
    batchCreateOrUpdateTool
  ],
  triggers: [entityChangesTrigger]
});
