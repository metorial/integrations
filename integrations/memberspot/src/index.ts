import { Slate } from 'slates';
import { spec } from './spec';
import {
  listUsersTool,
  findUserTool,
  grantAccessTool,
  manageAccessTool,
  deleteUsersTool,
  listOffersTool,
  getCourseProgressTool,
  manageCustomPropertiesTool,
  enableChapterAccessTool,
  getExamResultsTool,
  getLoginTokenTool,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listUsersTool,
    findUserTool,
    grantAccessTool,
    manageAccessTool,
    deleteUsersTool,
    listOffersTool,
    getCourseProgressTool,
    manageCustomPropertiesTool,
    enableChapterAccessTool,
    getExamResultsTool,
    getLoginTokenTool,
  ],
  triggers: [
    inboundWebhook,
  ],
});
