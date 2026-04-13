import { Slate } from 'slates';
import { spec } from './spec';
import {
  renderDocument,
  listTemplates,
  deleteTemplate,
  getTemplateStructure,
  getTemplateDetails,
  getEnvironmentStatus,
  getRenderTags
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    renderDocument,
    listTemplates,
    deleteTemplate,
    getTemplateStructure,
    getTemplateDetails,
    getEnvironmentStatus,
    getRenderTags
  ],
  triggers: [
    inboundWebhook,
  ]
});
