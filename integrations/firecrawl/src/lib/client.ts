import { createAxios } from 'slates';

let api = createAxios({
  baseURL: 'https://api.firecrawl.dev/v2',
});

export interface ScrapeOptions {
  formats?: string[];
  onlyMainContent?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
  headers?: Record<string, string>;
  waitFor?: number;
  mobile?: boolean;
  timeout?: number;
  actions?: Array<Record<string, any>>;
  location?: {
    country?: string;
    languages?: string[];
  };
}

export interface CrawlOptions {
  url: string;
  limit?: number;
  maxDiscoveryDepth?: number;
  includePaths?: string[];
  excludePaths?: string[];
  allowExternalLinks?: boolean;
  allowSubdomains?: boolean;
  crawlEntireDomain?: boolean;
  sitemap?: 'skip' | 'include' | 'only';
  delay?: number;
  maxConcurrency?: number;
  scrapeOptions?: ScrapeOptions;
  webhook?: WebhookConfig;
}

export interface WebhookConfig {
  url: string;
  metadata?: Record<string, any>;
  events?: string[];
}

export interface SearchOptions {
  query: string;
  limit?: number;
  sources?: string[];
  categories?: string[];
  location?: string;
  country?: string;
  tbs?: string;
  scrapeOptions?: ScrapeOptions;
}

export interface MapOptions {
  url: string;
  search?: string;
  sitemap?: 'skip' | 'include' | 'only';
  includeSubdomains?: boolean;
  ignoreQueryParameters?: boolean;
  limit?: number;
}

export interface ExtractOptions {
  urls: string[];
  prompt?: string;
  schema?: Record<string, any>;
  enableWebSearch?: boolean;
  showSources?: boolean;
  scrapeOptions?: ScrapeOptions;
}

export interface BatchScrapeOptions {
  urls: string[];
  scrapeOptions?: ScrapeOptions;
  webhook?: WebhookConfig;
  maxConcurrency?: number;
}

export class Client {
  private token: string;

  constructor(config: { token: string }) {
    this.token = config.token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async scrape(url: string, options?: ScrapeOptions) {
    let response = await api.post('/scrape', {
      url,
      ...options,
    }, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async startCrawl(options: CrawlOptions) {
    let response = await api.post('/crawl', options, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getCrawlStatus(crawlId: string) {
    let response = await api.get(`/crawl/${crawlId}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async cancelCrawl(crawlId: string) {
    let response = await api.delete(`/crawl/${crawlId}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async search(options: SearchOptions) {
    let response = await api.post('/search', options, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async map(options: MapOptions) {
    let response = await api.post('/map', options, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async startExtract(options: ExtractOptions) {
    let response = await api.post('/extract', options, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getExtractStatus(extractId: string) {
    let response = await api.get(`/extract/${extractId}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async startBatchScrape(options: BatchScrapeOptions) {
    let response = await api.post('/batch/scrape', {
      urls: options.urls,
      ...options.scrapeOptions,
      webhook: options.webhook,
      maxConcurrency: options.maxConcurrency,
    }, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getBatchScrapeStatus(batchId: string) {
    let response = await api.get(`/batch/scrape/${batchId}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async startAgent(options: {
    prompt: string;
    urls?: string[];
    schema?: Record<string, any>;
    maxCredits?: number;
    strictConstrainToURLs?: boolean;
    model?: string;
  }) {
    let response = await api.post('/agent', options, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getAgentStatus(agentId: string) {
    let response = await api.get(`/agent/${agentId}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }
}
