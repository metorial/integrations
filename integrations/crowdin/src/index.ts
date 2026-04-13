import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjectsTool,
  getProjectTool,
  manageProjectTool,
  listFilesTool,
  manageSourceFileTool,
  downloadFileTool,
  manageStringsTool,
  translationStatusTool,
  buildTranslationsTool,
  manageTranslationsTool,
  manageTMTool,
  manageGlossaryTool,
  manageTasksTool,
  listMembersTool
} from './tools';
import {
  fileEventsTrigger,
  projectEventsTrigger,
  stringEventsTrigger,
  suggestionEventsTrigger,
  taskEventsTrigger,
  commentEventsTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProjectsTool,
    getProjectTool,
    manageProjectTool,
    listFilesTool,
    manageSourceFileTool,
    downloadFileTool,
    manageStringsTool,
    translationStatusTool,
    buildTranslationsTool,
    manageTranslationsTool,
    manageTMTool,
    manageGlossaryTool,
    manageTasksTool,
    listMembersTool
  ],
  triggers: [
    fileEventsTrigger,
    projectEventsTrigger,
    stringEventsTrigger,
    suggestionEventsTrigger,
    taskEventsTrigger,
    commentEventsTrigger
  ]
});
