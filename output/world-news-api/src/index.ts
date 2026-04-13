import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  searchNewsTool,
  topNewsTool,
  retrieveArticleTool,
  extractNewsTool,
  extractNewsLinksTool,
  searchNewsSourcesTool,
  newspaperFrontPagesTool,
  geoCoordinatesTool,
} from './tools';
import { newArticlesTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchNewsTool,
    topNewsTool,
    retrieveArticleTool,
    extractNewsTool,
    extractNewsLinksTool,
    searchNewsSourcesTool,
    newspaperFrontPagesTool,
    geoCoordinatesTool,
  ],
  triggers: [
    inboundWebhook,
    newArticlesTrigger,
  ],
});
