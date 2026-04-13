import { Slate } from 'slates';
import { spec } from './spec';
import {
  geocodeTool,
  directionsTool,
  manageStylesTool,
  manageDatasetsTool,
  manageDatasetFeaturesTool,
  staticImageTool,
  isochroneTool,
  matrixTool,
  mapMatchingTool,
  optimizeRouteTool,
  tilequeryTool,
  manageTokensTool,
  manageTilesetsTool,
  manageUploadsTool,
  listFontsTool,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    geocodeTool.build(),
    directionsTool.build(),
    manageStylesTool.build(),
    manageDatasetsTool.build(),
    manageDatasetFeaturesTool.build(),
    staticImageTool.build(),
    isochroneTool.build(),
    matrixTool.build(),
    mapMatchingTool.build(),
    optimizeRouteTool.build(),
    tilequeryTool.build(),
    manageTokensTool.build(),
    manageTilesetsTool.build(),
    manageUploadsTool.build(),
    listFontsTool.build(),
  ],
  triggers: [
    inboundWebhook,
  ],
});
