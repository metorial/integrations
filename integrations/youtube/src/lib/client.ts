import { createAxios } from 'slates';
import type {
  YouTubeVideo,
  YouTubeListResponse,
  YouTubeSearchResult,
  YouTubeChannel,
  YouTubePlaylist,
  YouTubePlaylistItem,
  YouTubeCommentThread,
  YouTubeComment,
  YouTubeSubscription,
  YouTubeCaption,
  YouTubeActivity
} from './types';

export class Client {
  private axios;

  constructor(private config: { token: string }) {
    this.axios = createAxios({
      baseURL: 'https://www.googleapis.com/youtube/v3',
      headers: {
        Authorization: `Bearer ${config.token}`
      }
    });
  }

  // --- Videos ---

  async listVideos(params: {
    part: string[];
    videoId?: string;
    chart?: string;
    myRating?: string;
    maxResults?: number;
    pageToken?: string;
    regionCode?: string;
    videoCategoryId?: string;
  }): Promise<YouTubeListResponse<YouTubeVideo>> {
    let response = await this.axios.get('/videos', {
      params: {
        part: params.part.join(','),
        id: params.videoId,
        chart: params.chart,
        myRating: params.myRating,
        maxResults: params.maxResults,
        pageToken: params.pageToken,
        regionCode: params.regionCode,
        videoCategoryId: params.videoCategoryId
      }
    });
    return response.data;
  }

  async updateVideo(params: {
    part: string[];
    videoId: string;
    snippet?: {
      title?: string;
      description?: string;
      tags?: string[];
      categoryId?: string;
      defaultLanguage?: string;
    };
    status?: {
      privacyStatus?: string;
      publishAt?: string;
      license?: string;
      embeddable?: boolean;
      publicStatsViewable?: boolean;
      madeForKids?: boolean;
      selfDeclaredMadeForKids?: boolean;
    };
  }): Promise<YouTubeVideo> {
    let body: Record<string, any> = {
      id: params.videoId
    };
    if (params.snippet) {
      body.snippet = params.snippet;
    }
    if (params.status) {
      body.status = params.status;
    }

    let response = await this.axios.put('/videos', body, {
      params: {
        part: params.part.join(',')
      }
    });
    return response.data;
  }

  async deleteVideo(videoId: string): Promise<void> {
    await this.axios.delete('/videos', {
      params: { id: videoId }
    });
  }

  async rateVideo(videoId: string, rating: string): Promise<void> {
    await this.axios.post('/videos/rate', null, {
      params: {
        id: videoId,
        rating
      }
    });
  }

  async getVideoRating(
    videoIds: string[]
  ): Promise<{ items: Array<{ videoId: string; rating: string }> }> {
    let response = await this.axios.get('/videos/getRating', {
      params: {
        id: videoIds.join(',')
      }
    });
    return response.data;
  }

  // --- Search ---

  async search(params: {
    query?: string;
    part?: string[];
    type?: string[];
    channelId?: string;
    maxResults?: number;
    pageToken?: string;
    order?: string;
    publishedAfter?: string;
    publishedBefore?: string;
    regionCode?: string;
    relevanceLanguage?: string;
    videoDuration?: string;
    videoDefinition?: string;
    videoType?: string;
    videoCaption?: string;
    topicId?: string;
    eventType?: string;
    location?: string;
    locationRadius?: string;
  }): Promise<YouTubeListResponse<YouTubeSearchResult>> {
    let response = await this.axios.get('/search', {
      params: {
        q: params.query,
        part: (params.part || ['snippet']).join(','),
        type: params.type?.join(','),
        channelId: params.channelId,
        maxResults: params.maxResults || 25,
        pageToken: params.pageToken,
        order: params.order,
        publishedAfter: params.publishedAfter,
        publishedBefore: params.publishedBefore,
        regionCode: params.regionCode,
        relevanceLanguage: params.relevanceLanguage,
        videoDuration: params.videoDuration,
        videoDefinition: params.videoDefinition,
        videoType: params.videoType,
        videoCaption: params.videoCaption,
        topicId: params.topicId,
        eventType: params.eventType,
        location: params.location,
        locationRadius: params.locationRadius
      }
    });
    return response.data;
  }

  // --- Channels ---

  async listChannels(params: {
    part: string[];
    channelId?: string;
    forUsername?: string;
    mine?: boolean;
    maxResults?: number;
    pageToken?: string;
  }): Promise<YouTubeListResponse<YouTubeChannel>> {
    let response = await this.axios.get('/channels', {
      params: {
        part: params.part.join(','),
        id: params.channelId,
        forUsername: params.forUsername,
        mine: params.mine,
        maxResults: params.maxResults,
        pageToken: params.pageToken
      }
    });
    return response.data;
  }

  async updateChannel(params: {
    part: string[];
    channelId: string;
    brandingSettings?: {
      channel?: {
        title?: string;
        description?: string;
        keywords?: string;
        unsubscribedTrailer?: string;
        country?: string;
      };
    };
  }): Promise<YouTubeChannel> {
    let body: Record<string, any> = {
      id: params.channelId
    };
    if (params.brandingSettings) {
      body.brandingSettings = params.brandingSettings;
    }

    let response = await this.axios.put('/channels', body, {
      params: {
        part: params.part.join(',')
      }
    });
    return response.data;
  }

  // --- Playlists ---

  async listPlaylists(params: {
    part: string[];
    playlistId?: string;
    channelId?: string;
    mine?: boolean;
    maxResults?: number;
    pageToken?: string;
  }): Promise<YouTubeListResponse<YouTubePlaylist>> {
    let response = await this.axios.get('/playlists', {
      params: {
        part: params.part.join(','),
        id: params.playlistId,
        channelId: params.channelId,
        mine: params.mine,
        maxResults: params.maxResults,
        pageToken: params.pageToken
      }
    });
    return response.data;
  }

  async createPlaylist(params: {
    part: string[];
    title: string;
    description?: string;
    privacyStatus?: string;
    defaultLanguage?: string;
    tags?: string[];
  }): Promise<YouTubePlaylist> {
    let body: Record<string, any> = {
      snippet: {
        title: params.title,
        description: params.description,
        defaultLanguage: params.defaultLanguage,
        tags: params.tags
      }
    };
    if (params.privacyStatus) {
      body.status = { privacyStatus: params.privacyStatus };
    }

    let response = await this.axios.post('/playlists', body, {
      params: {
        part: params.part.join(',')
      }
    });
    return response.data;
  }

  async updatePlaylist(params: {
    part: string[];
    playlistId: string;
    title?: string;
    description?: string;
    privacyStatus?: string;
    defaultLanguage?: string;
  }): Promise<YouTubePlaylist> {
    let body: Record<string, any> = {
      id: params.playlistId,
      snippet: {
        title: params.title,
        description: params.description,
        defaultLanguage: params.defaultLanguage
      }
    };
    if (params.privacyStatus) {
      body.status = { privacyStatus: params.privacyStatus };
    }

    let response = await this.axios.put('/playlists', body, {
      params: {
        part: params.part.join(',')
      }
    });
    return response.data;
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    await this.axios.delete('/playlists', {
      params: { id: playlistId }
    });
  }

  // --- Playlist Items ---

  async listPlaylistItems(params: {
    part: string[];
    playlistId: string;
    maxResults?: number;
    pageToken?: string;
    videoId?: string;
  }): Promise<YouTubeListResponse<YouTubePlaylistItem>> {
    let response = await this.axios.get('/playlistItems', {
      params: {
        part: params.part.join(','),
        playlistId: params.playlistId,
        maxResults: params.maxResults,
        pageToken: params.pageToken,
        videoId: params.videoId
      }
    });
    return response.data;
  }

  async addPlaylistItem(params: {
    part: string[];
    playlistId: string;
    videoId: string;
    position?: number;
  }): Promise<YouTubePlaylistItem> {
    let body: Record<string, any> = {
      snippet: {
        playlistId: params.playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId: params.videoId
        }
      }
    };
    if (params.position !== undefined) {
      body.snippet.position = params.position;
    }

    let response = await this.axios.post('/playlistItems', body, {
      params: {
        part: params.part.join(',')
      }
    });
    return response.data;
  }

  async updatePlaylistItem(params: {
    part: string[];
    playlistItemId: string;
    playlistId: string;
    videoId: string;
    position?: number;
  }): Promise<YouTubePlaylistItem> {
    let body: Record<string, any> = {
      id: params.playlistItemId,
      snippet: {
        playlistId: params.playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId: params.videoId
        }
      }
    };
    if (params.position !== undefined) {
      body.snippet.position = params.position;
    }

    let response = await this.axios.put('/playlistItems', body, {
      params: {
        part: params.part.join(',')
      }
    });
    return response.data;
  }

  async deletePlaylistItem(playlistItemId: string): Promise<void> {
    await this.axios.delete('/playlistItems', {
      params: { id: playlistItemId }
    });
  }

  // --- Comment Threads ---

  async listCommentThreads(params: {
    part: string[];
    videoId?: string;
    channelId?: string;
    allThreadsRelatedToChannelId?: string;
    commentThreadId?: string;
    maxResults?: number;
    pageToken?: string;
    order?: string;
    searchTerms?: string;
    moderationStatus?: string;
  }): Promise<YouTubeListResponse<YouTubeCommentThread>> {
    let response = await this.axios.get('/commentThreads', {
      params: {
        part: params.part.join(','),
        videoId: params.videoId,
        channelId: params.channelId,
        allThreadsRelatedToChannelId: params.allThreadsRelatedToChannelId,
        id: params.commentThreadId,
        maxResults: params.maxResults,
        pageToken: params.pageToken,
        order: params.order,
        searchTerms: params.searchTerms,
        moderationStatus: params.moderationStatus
      }
    });
    return response.data;
  }

  async createCommentThread(params: {
    part: string[];
    videoId: string;
    channelId: string;
    text: string;
  }): Promise<YouTubeCommentThread> {
    let body = {
      snippet: {
        videoId: params.videoId,
        channelId: params.channelId,
        topLevelComment: {
          snippet: {
            textOriginal: params.text
          }
        }
      }
    };

    let response = await this.axios.post('/commentThreads', body, {
      params: {
        part: params.part.join(',')
      }
    });
    return response.data;
  }

  // --- Comments ---

  async listComments(params: {
    part: string[];
    parentId: string;
    maxResults?: number;
    pageToken?: string;
  }): Promise<YouTubeListResponse<YouTubeComment>> {
    let response = await this.axios.get('/comments', {
      params: {
        part: params.part.join(','),
        parentId: params.parentId,
        maxResults: params.maxResults,
        pageToken: params.pageToken
      }
    });
    return response.data;
  }

  async createComment(params: {
    part: string[];
    parentId: string;
    text: string;
  }): Promise<YouTubeComment> {
    let body = {
      snippet: {
        parentId: params.parentId,
        textOriginal: params.text
      }
    };

    let response = await this.axios.post('/comments', body, {
      params: {
        part: params.part.join(',')
      }
    });
    return response.data;
  }

  async updateComment(params: {
    part: string[];
    commentId: string;
    text: string;
  }): Promise<YouTubeComment> {
    let body = {
      id: params.commentId,
      snippet: {
        textOriginal: params.text
      }
    };

    let response = await this.axios.put('/comments', body, {
      params: {
        part: params.part.join(',')
      }
    });
    return response.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.axios.delete('/comments', {
      params: { id: commentId }
    });
  }

  async setCommentModerationStatus(params: {
    commentIds: string[];
    moderationStatus: string;
    banAuthor?: boolean;
  }): Promise<void> {
    await this.axios.post('/comments/setModerationStatus', null, {
      params: {
        id: params.commentIds.join(','),
        moderationStatus: params.moderationStatus,
        banAuthor: params.banAuthor
      }
    });
  }

  // --- Subscriptions ---

  async listSubscriptions(params: {
    part: string[];
    mine?: boolean;
    channelId?: string;
    forChannelId?: string;
    subscriptionId?: string;
    maxResults?: number;
    pageToken?: string;
    order?: string;
  }): Promise<YouTubeListResponse<YouTubeSubscription>> {
    let response = await this.axios.get('/subscriptions', {
      params: {
        part: params.part.join(','),
        mine: params.mine,
        channelId: params.channelId,
        forChannelId: params.forChannelId,
        id: params.subscriptionId,
        maxResults: params.maxResults,
        pageToken: params.pageToken,
        order: params.order
      }
    });
    return response.data;
  }

  async createSubscription(params: {
    part: string[];
    channelId: string;
  }): Promise<YouTubeSubscription> {
    let body = {
      snippet: {
        resourceId: {
          kind: 'youtube#channel',
          channelId: params.channelId
        }
      }
    };

    let response = await this.axios.post('/subscriptions', body, {
      params: {
        part: params.part.join(',')
      }
    });
    return response.data;
  }

  async deleteSubscription(subscriptionId: string): Promise<void> {
    await this.axios.delete('/subscriptions', {
      params: { id: subscriptionId }
    });
  }

  // --- Captions ---

  async listCaptions(params: {
    part: string[];
    videoId: string;
  }): Promise<YouTubeListResponse<YouTubeCaption>> {
    let response = await this.axios.get('/captions', {
      params: {
        part: params.part.join(','),
        videoId: params.videoId
      }
    });
    return response.data;
  }

  async deleteCaption(captionId: string): Promise<void> {
    await this.axios.delete('/captions', {
      params: { id: captionId }
    });
  }

  // --- Activities ---

  async listActivities(params: {
    part: string[];
    channelId?: string;
    mine?: boolean;
    maxResults?: number;
    pageToken?: string;
    publishedAfter?: string;
    publishedBefore?: string;
  }): Promise<YouTubeListResponse<YouTubeActivity>> {
    let response = await this.axios.get('/activities', {
      params: {
        part: params.part.join(','),
        channelId: params.channelId,
        mine: params.mine,
        maxResults: params.maxResults,
        pageToken: params.pageToken,
        publishedAfter: params.publishedAfter,
        publishedBefore: params.publishedBefore
      }
    });
    return response.data;
  }

  // --- Video Categories ---

  async listVideoCategories(params: {
    part: string[];
    regionCode?: string;
    videoCategoryId?: string;
  }): Promise<
    YouTubeListResponse<{
      id: string;
      snippet: { channelId: string; title: string; assignable: boolean };
    }>
  > {
    let response = await this.axios.get('/videoCategories', {
      params: {
        part: params.part.join(','),
        regionCode: params.regionCode,
        id: params.videoCategoryId
      }
    });
    return response.data;
  }

  // --- i18n ---

  async listRegions(params: {
    part: string[];
  }): Promise<YouTubeListResponse<{ id: string; snippet: { gl: string; name: string } }>> {
    let response = await this.axios.get('/i18nRegions', {
      params: {
        part: params.part.join(',')
      }
    });
    return response.data;
  }

  async listLanguages(params: {
    part: string[];
  }): Promise<YouTubeListResponse<{ id: string; snippet: { hl: string; name: string } }>> {
    let response = await this.axios.get('/i18nLanguages', {
      params: {
        part: params.part.join(',')
      }
    });
    return response.data;
  }
}
