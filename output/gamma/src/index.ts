import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateContentTool,
  generateFromTemplateTool,
  getGenerationStatusTool,
  listThemesTool,
  listFoldersTool,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    generateContentTool.build(),
    generateFromTemplateTool.build(),
    getGenerationStatusTool.build(),
    listThemesTool.build(),
    listFoldersTool.build(),
  ],
  triggers: [
    inboundWebhook,
  ],
});
