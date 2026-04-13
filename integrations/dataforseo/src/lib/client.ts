import { createAxios } from 'slates';
import type { AxiosInstance } from 'axios';

export interface DataForSEOResponse<T = any> {
  version: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks: Array<{
    id: string;
    status_code: number;
    status_message: string;
    time: string;
    cost: number;
    result_count: number;
    path: string[];
    data: any;
    result: T[];
  }>;
}

export class Client {
  private axios: AxiosInstance;

  constructor(private config: { token: string }) {
    this.axios = createAxios({
      baseURL: 'https://api.dataforseo.com/v3',
      headers: {
        Authorization: `Basic ${config.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // ─── SERP ────────────────────────────────────────────────────────────

  async serpGoogleOrganicLive(params: {
    keyword: string;
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
    device?: string;
    os?: string;
    depth?: number;
  }) {
    let body = [
      {
        keyword: params.keyword,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode,
        device: params.device,
        os: params.os,
        depth: params.depth
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/serp/google/organic/live/advanced',
      body
    );
    return response.data;
  }

  // ─── Keywords Data ───────────────────────────────────────────────────

  async keywordsSearchVolumeLive(params: {
    keywords: string[];
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
    searchPartners?: boolean;
  }) {
    let body = [
      {
        keywords: params.keywords,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode,
        search_partners: params.searchPartners
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/keywords_data/google_ads/search_volume/live',
      body
    );
    return response.data;
  }

  async keywordsForSiteLive(params: {
    target: string;
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
    includeSerpInfo?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let body = [
      {
        target: params.target,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode,
        include_serp_info: params.includeSerpInfo,
        limit: params.limit,
        offset: params.offset
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/keywords_data/google_ads/keywords_for_site/live',
      body
    );
    return response.data;
  }

  // ─── Backlinks ───────────────────────────────────────────────────────

  async backlinksSummaryLive(params: {
    target: string;
    includeSubdomains?: boolean;
    includeIndirectLinks?: boolean;
  }) {
    let body = [
      {
        target: params.target,
        include_subdomains: params.includeSubdomains,
        include_indirect_links: params.includeIndirectLinks
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>('/backlinks/summary/live', body);
    return response.data;
  }

  async backlinksLive(params: {
    target: string;
    mode?: string;
    limit?: number;
    offset?: number;
    includeSubdomains?: boolean;
    backlinksFilters?: string[];
    orderBy?: string[];
  }) {
    let body = [
      {
        target: params.target,
        mode: params.mode,
        limit: params.limit,
        offset: params.offset,
        include_subdomains: params.includeSubdomains,
        backlinks_filters: params.backlinksFilters,
        order_by: params.orderBy
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/backlinks/backlinks/live',
      body
    );
    return response.data;
  }

  async backlinksReferringDomainsLive(params: {
    target: string;
    limit?: number;
    offset?: number;
    includeSubdomains?: boolean;
    orderBy?: string[];
  }) {
    let body = [
      {
        target: params.target,
        limit: params.limit,
        offset: params.offset,
        include_subdomains: params.includeSubdomains,
        order_by: params.orderBy
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/backlinks/referring_domains/live',
      body
    );
    return response.data;
  }

  // ─── Domain Analytics ────────────────────────────────────────────────

  async whoisOverviewLive(params: { target: string }) {
    let body = [
      {
        target: params.target
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/domain_analytics/whois/overview/live',
      body
    );
    return response.data;
  }

  async technologiesDomainTechnologiesLive(params: { target: string }) {
    let body = [
      {
        target: params.target
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/domain_analytics/technologies/domain_technologies/live',
      body
    );
    return response.data;
  }

  // ─── On-Page ─────────────────────────────────────────────────────────

  async onPageTaskPost(params: {
    target: string;
    maxCrawlPages?: number;
    startUrl?: string;
    enableJavascript?: boolean;
    customJsScript?: string;
    maxCrawlDepth?: number;
    checkSpell?: boolean;
    loadResources?: boolean;
  }) {
    let body = [
      {
        target: params.target,
        max_crawl_pages: params.maxCrawlPages,
        start_url: params.startUrl,
        enable_javascript: params.enableJavascript,
        custom_js_script: params.customJsScript,
        max_crawl_depth: params.maxCrawlDepth,
        check_spell: params.checkSpell,
        load_resources: params.loadResources
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>('/on_page/task_post', body);
    return response.data;
  }

  async onPageSummary(taskId: string) {
    let body = [
      {
        id: taskId
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>('/on_page/summary', body);
    return response.data;
  }

  async onPagePagesLive(params: {
    target: string;
    limit?: number;
    offset?: number;
    filters?: string[];
    orderBy?: string[];
  }) {
    let body = [
      {
        target: params.target,
        limit: params.limit,
        offset: params.offset,
        filters: params.filters,
        order_by: params.orderBy
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>('/on_page/pages', body);
    return response.data;
  }

  // ─── Content Analysis ────────────────────────────────────────────────

  async contentAnalysisSearchLive(params: {
    keyword: string;
    keywordFields?: Record<string, string>;
    pageType?: string[];
    searchMode?: string;
    limit?: number;
    offset?: number;
    internalListLimit?: number;
    positiveConnotationThreshold?: number;
    sentimentConnotation?: string;
    orderBy?: string[];
  }) {
    let body = [
      {
        keyword: params.keyword,
        keyword_fields: params.keywordFields,
        page_type: params.pageType,
        search_mode: params.searchMode,
        limit: params.limit,
        offset: params.offset,
        internal_list_limit: params.internalListLimit,
        positive_connotation_threshold: params.positiveConnotationThreshold,
        sentiment_connotation: params.sentimentConnotation,
        order_by: params.orderBy
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/content_analysis/search/live',
      body
    );
    return response.data;
  }

  async contentAnalysisSummaryLive(params: {
    keyword: string;
    keywordFields?: Record<string, string>;
    pageType?: string[];
    internalListLimit?: number;
  }) {
    let body = [
      {
        keyword: params.keyword,
        keyword_fields: params.keywordFields,
        page_type: params.pageType,
        internal_list_limit: params.internalListLimit
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/content_analysis/summary/live',
      body
    );
    return response.data;
  }

  // ─── DataForSEO Labs ────────────────────────────────────────────────

  async labsKeywordSuggestionsLive(params: {
    keyword: string;
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
    includeSerpInfo?: boolean;
    limit?: number;
    offset?: number;
    filters?: string[];
    orderBy?: string[];
  }) {
    let body = [
      {
        keyword: params.keyword,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode,
        include_serp_info: params.includeSerpInfo,
        limit: params.limit,
        offset: params.offset,
        filters: params.filters,
        order_by: params.orderBy
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/dataforseo_labs/google/keyword_suggestions/live',
      body
    );
    return response.data;
  }

  async labsRelatedKeywordsLive(params: {
    keyword: string;
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
    includeSerpInfo?: boolean;
    limit?: number;
    offset?: number;
    filters?: string[];
    orderBy?: string[];
  }) {
    let body = [
      {
        keyword: params.keyword,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode,
        include_serp_info: params.includeSerpInfo,
        limit: params.limit,
        offset: params.offset,
        filters: params.filters,
        order_by: params.orderBy
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/dataforseo_labs/google/related_keywords/live',
      body
    );
    return response.data;
  }

  async labsDomainRankOverviewLive(params: {
    target: string;
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
  }) {
    let body = [
      {
        target: params.target,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/dataforseo_labs/google/domain_rank_overview/live',
      body
    );
    return response.data;
  }

  async labsCompetitorsDomainLive(params: {
    target: string;
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
    limit?: number;
    offset?: number;
    filters?: string[];
    orderBy?: string[];
  }) {
    let body = [
      {
        target: params.target,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode,
        limit: params.limit,
        offset: params.offset,
        filters: params.filters,
        order_by: params.orderBy
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/dataforseo_labs/google/competitors_domain/live',
      body
    );
    return response.data;
  }

  async labsDomainIntersectionLive(params: {
    targets: Record<string, string>;
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
    limit?: number;
    offset?: number;
    filters?: string[];
    orderBy?: string[];
  }) {
    let body = [
      {
        targets: params.targets,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode,
        limit: params.limit,
        offset: params.offset,
        filters: params.filters,
        order_by: params.orderBy
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/dataforseo_labs/google/domain_intersection/live',
      body
    );
    return response.data;
  }

  // ─── Merchant ────────────────────────────────────────────────────────

  async merchantGoogleProductsLive(params: {
    keyword: string;
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
    device?: string;
    os?: string;
    limit?: number;
    offset?: number;
  }) {
    let body = [
      {
        keyword: params.keyword,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode,
        device: params.device,
        os: params.os,
        limit: params.limit,
        offset: params.offset
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/merchant/google/products/task_post',
      body
    );
    return response.data;
  }

  async merchantAmazonProductsLive(params: {
    keyword: string;
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
    depth?: number;
  }) {
    let body = [
      {
        keyword: params.keyword,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode,
        depth: params.depth
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/merchant/amazon/products/task_post',
      body
    );
    return response.data;
  }

  async merchantAmazonAsinLive(params: {
    asin: string;
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
  }) {
    let body = [
      {
        asin: params.asin,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/merchant/amazon/asin/task_post',
      body
    );
    return response.data;
  }

  // ─── App Data ────────────────────────────────────────────────────────

  async appDataGooglePlaySearchLive(params: {
    keyword: string;
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
    depth?: number;
  }) {
    let body = [
      {
        keyword: params.keyword,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode,
        depth: params.depth
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/app_data/google/app_searches/task_post',
      body
    );
    return response.data;
  }

  async appDataGooglePlayInfoLive(params: {
    appId: string;
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
  }) {
    let body = [
      {
        app_id: params.appId,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/app_data/google/app_info/task_post',
      body
    );
    return response.data;
  }

  async appDataGooglePlayReviewsLive(params: {
    appId: string;
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
    depth?: number;
    sortBy?: string;
  }) {
    let body = [
      {
        app_id: params.appId,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode,
        depth: params.depth,
        sort_by: params.sortBy
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/app_data/google/app_reviews/task_post',
      body
    );
    return response.data;
  }

  // ─── Business Data ───────────────────────────────────────────────────

  async businessDataGoogleReviewsLive(params: {
    keyword: string;
    locationName?: string;
    locationCode?: number;
    languageName?: string;
    languageCode?: string;
    depth?: number;
    sortBy?: string;
  }) {
    let body = [
      {
        keyword: params.keyword,
        location_name: params.locationName,
        location_code: params.locationCode,
        language_name: params.languageName,
        language_code: params.languageCode,
        depth: params.depth,
        sort_by: params.sortBy
      }
    ];
    let response = await this.axios.post<DataForSEOResponse>(
      '/business_data/google/reviews/task_post',
      body
    );
    return response.data;
  }

  // ─── Tasks ───────────────────────────────────────────────────────────

  async getTasksReady(endpoint: string) {
    let response = await this.axios.get<DataForSEOResponse>(`/${endpoint}/tasks_ready`);
    return response.data;
  }

  async getTaskResult(endpoint: string, taskId: string) {
    let response = await this.axios.get<DataForSEOResponse>(
      `/${endpoint}/task_get/advanced/${taskId}`
    );
    return response.data;
  }

  // ─── Utility: Extract results ────────────────────────────────────────

  extractResults<T = any>(response: DataForSEOResponse<T>): T[] {
    if (!response.tasks || response.tasks.length === 0) {
      return [];
    }
    let task = response.tasks[0];
    if (!task) return [];
    if (task.status_code !== 20000) {
      throw new Error(`Task error: ${task.status_message} (code: ${task.status_code})`);
    }
    return task.result || [];
  }

  extractFirstResult<T = any>(response: DataForSEOResponse<T>): T | null {
    let results = this.extractResults(response);
    return results[0] ?? null;
  }

  extractTaskId(response: DataForSEOResponse): string | null {
    if (!response.tasks || response.tasks.length === 0) return null;
    return response.tasks[0]?.id ?? null;
  }
}
