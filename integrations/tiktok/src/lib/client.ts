import { createAxios } from 'slates';
import type { AxiosInstance } from 'axios';

export class TikTokConsumerClient {
  private axios: AxiosInstance;

  constructor(private config: { token: string }) {
    this.axios = createAxios({
      baseURL: 'https://open.tiktokapis.com/v2',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // ── User ──

  async getUserInfo(fields: string[]): Promise<TikTokUser> {
    let response = await this.axios.get(`/user/info/?fields=${fields.join(',')}`);
    return response.data?.data?.user ?? {};
  }

  // ── Videos ──

  async listVideos(params: {
    fields: string[];
    cursor?: number;
    maxCount?: number;
  }): Promise<{ videos: TikTokVideo[]; cursor: number; hasMore: boolean }> {
    let response = await this.axios.post(
      `/video/list/?fields=${params.fields.join(',')}`,
      {
        cursor: params.cursor,
        max_count: params.maxCount ?? 20,
      }
    );
    let data = response.data?.data ?? {};
    return {
      videos: data.videos ?? [],
      cursor: data.cursor ?? 0,
      hasMore: data.has_more ?? false,
    };
  }

  async queryVideos(params: {
    videoIds: string[];
    fields: string[];
  }): Promise<TikTokVideo[]> {
    let response = await this.axios.post(
      `/video/query/?fields=${params.fields.join(',')}`,
      {
        filters: {
          video_ids: params.videoIds,
        },
      }
    );
    return response.data?.data?.videos ?? [];
  }

  // ── Content Posting ──

  async queryCreatorInfo(): Promise<TikTokCreatorInfo> {
    let response = await this.axios.post('/post/publish/creator_info/query/', {});
    return response.data?.data ?? {};
  }

  async initVideoPost(params: {
    postInfo: {
      privacyLevel: string;
      title?: string;
      disableDuet?: boolean;
      disableStitch?: boolean;
      disableComment?: boolean;
      videoCoverTimestampMs?: number;
      brandContentToggle?: boolean;
      brandOrganicToggle?: boolean;
      isAigc?: boolean;
    };
    sourceInfo: {
      source: 'PULL_FROM_URL' | 'FILE_UPLOAD';
      videoUrl?: string;
      videoSize?: number;
      chunkSize?: number;
      totalChunkCount?: number;
    };
  }): Promise<{ publishId: string; uploadUrl?: string }> {
    let response = await this.axios.post('/post/publish/video/init/', {
      post_info: {
        privacy_level: params.postInfo.privacyLevel,
        title: params.postInfo.title,
        disable_duet: params.postInfo.disableDuet,
        disable_stitch: params.postInfo.disableStitch,
        disable_comment: params.postInfo.disableComment,
        video_cover_timestamp_ms: params.postInfo.videoCoverTimestampMs,
        brand_content_toggle: params.postInfo.brandContentToggle,
        brand_organic_toggle: params.postInfo.brandOrganicToggle,
        is_aigc: params.postInfo.isAigc,
      },
      source_info: {
        source: params.sourceInfo.source,
        video_url: params.sourceInfo.videoUrl,
        video_size: params.sourceInfo.videoSize,
        chunk_size: params.sourceInfo.chunkSize,
        total_chunk_count: params.sourceInfo.totalChunkCount,
      },
    });
    let data = response.data?.data ?? {};
    return {
      publishId: data.publish_id,
      uploadUrl: data.upload_url,
    };
  }

  async initPhotoPost(params: {
    postInfo: {
      privacyLevel: string;
      title?: string;
      disableComment?: boolean;
      brandContentToggle?: boolean;
      brandOrganicToggle?: boolean;
      isAigc?: boolean;
    };
    sourceInfo: {
      source: 'PULL_FROM_URL';
      photoImages: string[];
      photoCoverIndex?: number;
    };
  }): Promise<{ publishId: string }> {
    let response = await this.axios.post('/post/publish/content/init/', {
      post_info: {
        privacy_level: params.postInfo.privacyLevel,
        title: params.postInfo.title,
        disable_comment: params.postInfo.disableComment,
        brand_content_toggle: params.postInfo.brandContentToggle,
        brand_organic_toggle: params.postInfo.brandOrganicToggle,
        is_aigc: params.postInfo.isAigc,
      },
      source_info: {
        source: params.sourceInfo.source,
        photo_images: params.sourceInfo.photoImages,
        photo_cover_index: params.sourceInfo.photoCoverIndex,
      },
      media_type: 'PHOTO',
    });
    let data = response.data?.data ?? {};
    return {
      publishId: data.publish_id,
    };
  }

  async getPublishStatus(publishId: string): Promise<TikTokPublishStatus> {
    let response = await this.axios.post('/post/publish/status/fetch/', {
      publish_id: publishId,
    });
    return response.data?.data ?? {};
  }
}

export class TikTokBusinessClient {
  private axios: AxiosInstance;

  constructor(private config: { token: string }) {
    this.axios = createAxios({
      baseURL: 'https://business-api.tiktok.com/open_api/v1.3',
      headers: {
        'Access-Token': config.token,
        'Content-Type': 'application/json',
      },
    });
  }

  // ── Campaigns ──

  async getCampaigns(params: {
    advertiserId: string;
    campaignIds?: string[];
    page?: number;
    pageSize?: number;
  }): Promise<{ campaigns: TikTokCampaign[]; pageInfo: TikTokPageInfo }> {
    let filtering: Record<string, unknown> = {};
    if (params.campaignIds?.length) {
      filtering.campaign_ids = params.campaignIds;
    }
    let response = await this.axios.get('/campaign/get/', {
      params: {
        advertiser_id: params.advertiserId,
        filtering: JSON.stringify(filtering),
        page: params.page ?? 1,
        page_size: params.pageSize ?? 20,
      },
    });
    let data = response.data?.data ?? {};
    return {
      campaigns: (data.list ?? []).map(mapCampaign),
      pageInfo: mapPageInfo(data.page_info),
    };
  }

  async createCampaign(params: {
    advertiserId: string;
    campaignName: string;
    objectiveType: string;
    budgetMode?: string;
    budget?: number;
    operationStatus?: string;
    campaignType?: string;
    budgetOptimizeOn?: boolean;
  }): Promise<{ campaignId: string }> {
    let response = await this.axios.post('/campaign/create/', {
      advertiser_id: params.advertiserId,
      campaign_name: params.campaignName,
      objective_type: params.objectiveType,
      budget_mode: params.budgetMode,
      budget: params.budget,
      operation_status: params.operationStatus,
      campaign_type: params.campaignType,
      budget_optimize_on: params.budgetOptimizeOn,
    });
    let data = response.data?.data ?? {};
    return { campaignId: data.campaign_id };
  }

  async updateCampaign(params: {
    advertiserId: string;
    campaignId: string;
    campaignName?: string;
    budget?: number;
    budgetMode?: string;
    operationStatus?: string;
  }): Promise<{ campaignId: string }> {
    let response = await this.axios.post('/campaign/update/', {
      advertiser_id: params.advertiserId,
      campaign_id: params.campaignId,
      campaign_name: params.campaignName,
      budget: params.budget,
      budget_mode: params.budgetMode,
      operation_status: params.operationStatus,
    });
    let data = response.data?.data ?? {};
    return { campaignId: data.campaign_id };
  }

  async updateCampaignStatus(params: {
    advertiserId: string;
    campaignIds: string[];
    operationStatus: string;
  }): Promise<{ campaignIds: string[] }> {
    let response = await this.axios.post('/campaign/status/update/', {
      advertiser_id: params.advertiserId,
      campaign_ids: params.campaignIds,
      opt_status: params.operationStatus,
    });
    let data = response.data?.data ?? {};
    return { campaignIds: data.campaign_ids ?? [] };
  }

  // ── Ad Groups ──

  async getAdGroups(params: {
    advertiserId: string;
    campaignIds?: string[];
    adGroupIds?: string[];
    page?: number;
    pageSize?: number;
  }): Promise<{ adGroups: TikTokAdGroup[]; pageInfo: TikTokPageInfo }> {
    let filtering: Record<string, unknown> = {};
    if (params.campaignIds?.length) {
      filtering.campaign_ids = params.campaignIds;
    }
    if (params.adGroupIds?.length) {
      filtering.adgroup_ids = params.adGroupIds;
    }
    let response = await this.axios.get('/adgroup/get/', {
      params: {
        advertiser_id: params.advertiserId,
        filtering: JSON.stringify(filtering),
        page: params.page ?? 1,
        page_size: params.pageSize ?? 20,
      },
    });
    let data = response.data?.data ?? {};
    return {
      adGroups: (data.list ?? []).map(mapAdGroup),
      pageInfo: mapPageInfo(data.page_info),
    };
  }

  async createAdGroup(params: {
    advertiserId: string;
    campaignId: string;
    adGroupName: string;
    placementType?: string;
    placement?: string[];
    budget?: number;
    budgetMode?: string;
    scheduleType?: string;
    scheduleStartTime?: string;
    scheduleEndTime?: string;
    optimizeGoal?: string;
    billingEvent?: string;
    bidType?: string;
    bid?: number;
    pacing?: string;
    location?: string[];
    gender?: string;
    age?: string[];
  }): Promise<{ adGroupId: string }> {
    let response = await this.axios.post('/adgroup/create/', {
      advertiser_id: params.advertiserId,
      campaign_id: params.campaignId,
      adgroup_name: params.adGroupName,
      placement_type: params.placementType,
      placement: params.placement,
      budget: params.budget,
      budget_mode: params.budgetMode,
      schedule_type: params.scheduleType,
      schedule_start_time: params.scheduleStartTime,
      schedule_end_time: params.scheduleEndTime,
      optimize_goal: params.optimizeGoal,
      billing_event: params.billingEvent,
      bid_type: params.bidType,
      bid: params.bid,
      pacing: params.pacing,
      location: params.location,
      gender: params.gender,
      age: params.age,
    });
    let data = response.data?.data ?? {};
    return { adGroupId: data.adgroup_id };
  }

  // ── Ads ──

  async getAds(params: {
    advertiserId: string;
    adGroupIds?: string[];
    adIds?: string[];
    campaignIds?: string[];
    page?: number;
    pageSize?: number;
  }): Promise<{ ads: TikTokAd[]; pageInfo: TikTokPageInfo }> {
    let filtering: Record<string, unknown> = {};
    if (params.adGroupIds?.length) {
      filtering.adgroup_ids = params.adGroupIds;
    }
    if (params.adIds?.length) {
      filtering.ad_ids = params.adIds;
    }
    if (params.campaignIds?.length) {
      filtering.campaign_ids = params.campaignIds;
    }
    let response = await this.axios.get('/ad/get/', {
      params: {
        advertiser_id: params.advertiserId,
        filtering: JSON.stringify(filtering),
        page: params.page ?? 1,
        page_size: params.pageSize ?? 20,
      },
    });
    let data = response.data?.data ?? {};
    return {
      ads: (data.list ?? []).map(mapAd),
      pageInfo: mapPageInfo(data.page_info),
    };
  }

  // ── Reports ──

  async getReport(params: {
    advertiserId: string;
    reportType: string;
    dimensions: string[];
    metrics: string[];
    dataLevel: string;
    startDate: string;
    endDate: string;
    page?: number;
    pageSize?: number;
    filters?: Array<{ fieldName: string; filterType: string; filterValue: string }>;
  }): Promise<{ rows: Array<Record<string, unknown>>; pageInfo: TikTokPageInfo }> {
    let response = await this.axios.get('/report/integrated/get/', {
      params: {
        advertiser_id: params.advertiserId,
        report_type: params.reportType,
        dimensions: JSON.stringify(params.dimensions),
        metrics: JSON.stringify(params.metrics),
        data_level: params.dataLevel,
        start_date: params.startDate,
        end_date: params.endDate,
        page: params.page ?? 1,
        page_size: params.pageSize ?? 20,
        filtering: params.filters ? JSON.stringify(params.filters) : undefined,
      },
    });
    let data = response.data?.data ?? {};
    return {
      rows: data.list ?? [],
      pageInfo: mapPageInfo(data.page_info),
    };
  }
}

// ── Types ──

export interface TikTokUser {
  open_id?: string;
  union_id?: string;
  avatar_url?: string;
  avatar_url_100?: string;
  avatar_large_url?: string;
  display_name?: string;
  bio_description?: string;
  profile_deep_link?: string;
  is_verified?: boolean;
  username?: string;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
  video_count?: number;
}

export interface TikTokVideo {
  id?: string;
  create_time?: number;
  cover_image_url?: string;
  share_url?: string;
  video_description?: string;
  duration?: number;
  height?: number;
  width?: number;
  title?: string;
  embed_html?: string;
  embed_link?: string;
  like_count?: number;
  comment_count?: number;
  share_count?: number;
  view_count?: number;
}

export interface TikTokCreatorInfo {
  creator_avatar_url?: string;
  creator_username?: string;
  creator_nickname?: string;
  privacy_level_options?: string[];
  comment_disabled?: boolean;
  duet_disabled?: boolean;
  stitch_disabled?: boolean;
  max_video_post_duration_sec?: number;
}

export interface TikTokPublishStatus {
  status?: string;
  publish_status?: number;
  fail_reason?: string;
  publicaly_available_post_id?: string[];
}

export interface TikTokCampaign {
  campaignId: string;
  campaignName: string;
  objectiveType: string;
  budget: number;
  budgetMode: string;
  operationStatus: string;
  campaignType: string;
  createTime: string;
  modifyTime: string;
}

export interface TikTokAdGroup {
  adGroupId: string;
  adGroupName: string;
  campaignId: string;
  operationStatus: string;
  budget: number;
  budgetMode: string;
  optimizeGoal: string;
  billingEvent: string;
  scheduleStartTime: string;
  scheduleEndTime: string;
}

export interface TikTokAd {
  adId: string;
  adGroupId: string;
  campaignId: string;
  adName: string;
  operationStatus: string;
  createTime: string;
  modifyTime: string;
}

export interface TikTokPageInfo {
  page: number;
  pageSize: number;
  totalNumber: number;
  totalPage: number;
}

// ── Mappers ──

let mapCampaign = (raw: Record<string, any>): TikTokCampaign => ({
  campaignId: raw.campaign_id ?? '',
  campaignName: raw.campaign_name ?? '',
  objectiveType: raw.objective_type ?? '',
  budget: raw.budget ?? 0,
  budgetMode: raw.budget_mode ?? '',
  operationStatus: raw.operation_status ?? raw.opt_status ?? '',
  campaignType: raw.campaign_type ?? '',
  createTime: raw.create_time ?? '',
  modifyTime: raw.modify_time ?? '',
});

let mapAdGroup = (raw: Record<string, any>): TikTokAdGroup => ({
  adGroupId: raw.adgroup_id ?? '',
  adGroupName: raw.adgroup_name ?? '',
  campaignId: raw.campaign_id ?? '',
  operationStatus: raw.operation_status ?? raw.opt_status ?? '',
  budget: raw.budget ?? 0,
  budgetMode: raw.budget_mode ?? '',
  optimizeGoal: raw.optimize_goal ?? '',
  billingEvent: raw.billing_event ?? '',
  scheduleStartTime: raw.schedule_start_time ?? '',
  scheduleEndTime: raw.schedule_end_time ?? '',
});

let mapAd = (raw: Record<string, any>): TikTokAd => ({
  adId: raw.ad_id ?? '',
  adGroupId: raw.adgroup_id ?? '',
  campaignId: raw.campaign_id ?? '',
  adName: raw.ad_name ?? '',
  operationStatus: raw.operation_status ?? raw.opt_status ?? '',
  createTime: raw.create_time ?? '',
  modifyTime: raw.modify_time ?? '',
});

let mapPageInfo = (raw?: Record<string, any>): TikTokPageInfo => ({
  page: raw?.page ?? 1,
  pageSize: raw?.page_size ?? 20,
  totalNumber: raw?.total_number ?? 0,
  totalPage: raw?.total_page ?? 0,
});
