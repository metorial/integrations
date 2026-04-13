import { Slate } from 'slates';
import { spec } from './spec';
import {
  scrapePageTool,
  crawlWebsiteTool,
  getCrawlStatusTool,
  searchWebTool,
  mapWebsiteTool,
  extractDataTool,
  getExtractStatusTool,
  batchScrapeTool,
  getBatchScrapeStatusTool,
  runAgentTool,
  getAgentStatusTool
} from './tools';
import {
  crawlEventsTrigger,
  batchScrapeEventsTrigger,
  extractEventsTrigger,
  agentEventsTrigger
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
