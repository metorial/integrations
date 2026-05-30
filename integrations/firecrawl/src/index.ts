import { Slate } from 'slates';
import { spec } from './spec';
import {
  batchScrapeTool,
  crawlWebsiteTool,
  extractDataTool,
  getAgentStatusTool,
  getBatchScrapeStatusTool,
  getCrawlStatusTool,
  getExtractStatusTool,
  mapWebsiteTool,
  runAgentTool,
  scrapePageTool,
  searchWebTool
} from './tools';
import {
  agentEventsTrigger,
  batchScrapeEventsTrigger,
  crawlEventsTrigger,
  extractEventsTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    scrapePageTool.build(),
    crawlWebsiteTool.build(),
    getCrawlStatusTool.build(),
    searchWebTool.build(),
    mapWebsiteTool.build(),
    extractDataTool.build(),
    getExtractStatusTool.build(),
    batchScrapeTool.build(),
    getBatchScrapeStatusTool.build(),
    runAgentTool.build(),
    getAgentStatusTool.build()
  ],
  triggers: [
    crawlEventsTrigger.build(),
    batchScrapeEventsTrigger.build(),
    extractEventsTrigger.build(),
    agentEventsTrigger.build()
  ]
});
