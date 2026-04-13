import { createAxios } from 'slates';
import type { AxiosInstance } from 'axios';

export interface ClientConfig {
  token: string;
  apiVersion?: string;
}

export class InstagramClient {
  private api: AxiosInstance;
  private token: string;

  constructor(config: ClientConfig) {
    let version = config.apiVersion || 'v21.0';
    this.token = config.token;
    this.api = createAxios({
      baseURL: `https://graph.facebook.com/${version}`
    });
  }

  // ─── Profile ─────────────────────────────────────────────

  async getProfile(userId: string, fields?: string) {
    let defaultFields =
      'id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count,website,ig_id';
    let response = await this.api.get(`/${userId}`, {
      params: {
        fields: fields || defaultFields,
        access_token: this.token
      }
    });
    return response.data;
  }

  // ─── Media ───────────────────────────────────────────────

  async listMedia(
    userId: string,
    options?: {
      fields?: string;
      limit?: number;
      after?: string;
      before?: string;
    }
  ) {
    let defaultFields =
      'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,is_shared_to_feed';
    let response = await this.api.get(`/${userId}/media`, {
      params: {
        fields: options?.fields || defaultFields,
        limit: options?.limit || 25,
        after: options?.after,
        before: options?.before,
        access_token: this.token
      }
    });
    return response.data;
  }

  async getMedia(mediaId: string, fields?: string) {
    let defaultFields =
      'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,username,children{id,media_type,media_url,thumbnail_url}';
    let response = await this.api.get(`/${mediaId}`, {
      params: {
        fields: fields || defaultFields,
        access_token: this.token
      }
    });
    return response.data;
  }

  // ─── Publishing ──────────────────────────────────────────

  async createMediaContainer(
    userId: string,
    params: {
      imageUrl?: string;
      videoUrl?: string;
      caption?: string;
      mediaType?: string;
      isCarouselItem?: boolean;
      locationId?: string;
      userTags?: Array<{ username: string; x: number; y: number }>;
      coverUrl?: string;
      shareToFeed?: boolean;
      children?: string[];
    }
  ) {
    let body: Record<string, any> = {
      access_token: this.token
    };

    if (params.caption) body.caption = params.caption;
    if (params.locationId) body.location_id = params.locationId;

    if (params.mediaType === 'CAROUSEL') {
      body.media_type = 'CAROUSEL';
      if (params.children) body.children = params.children.join(',');
    } else if (params.mediaType === 'REELS' || params.videoUrl) {
      body.media_type = 'REELS';
      body.video_url = params.videoUrl;
      if (params.coverUrl) body.cover_url = params.coverUrl;
      if (params.shareToFeed !== undefined) body.share_to_feed = params.shareToFeed;
    } else if (params.mediaType === 'STORIES') {
      body.media_type = 'STORIES';
      if (params.imageUrl) body.image_url = params.imageUrl;
      if (params.videoUrl) body.video_url = params.videoUrl;
    } else {
      body.image_url = params.imageUrl;
    }

    if (params.isCarouselItem) body.is_carousel_item = true;

    if (params.userTags && params.userTags.length > 0) {
      body.user_tags = JSON.stringify(
        params.userTags.map(t => ({
          username: t.username,
          x: t.x,
          y: t.y
        }))
      );
    }

    let response = await this.api.post(`/${userId}/media`, null, { params: body });
    return response.data;
  }

  async getContainerStatus(containerId: string) {
    let response = await this.api.get(`/${containerId}`, {
      params: {
        fields: 'status_code,status',
        access_token: this.token
      }
    });
    return response.data;
  }

  async publishMedia(userId: string, creationId: string) {
    let response = await this.api.post(`/${userId}/media_publish`, null, {
      params: {
        creation_id: creationId,
        access_token: this.token
      }
    });
    return response.data;
  }

  // ─── Comments ────────────────────────────────────────────

  async getComments(mediaId: string, options?: { limit?: number; after?: string }) {
    let response = await this.api.get(`/${mediaId}/comments`, {
      params: {
        fields: 'id,text,timestamp,username,like_count,replies{id,text,timestamp,username}',
        limit: options?.limit || 50,
        after: options?.after,
        access_token: this.token
      }
    });
    return response.data;
  }

  async replyToComment(commentId: string, message: string) {
    let response = await this.api.post(`/${commentId}/replies`, null, {
      params: {
        message,
        access_token: this.token
      }
    });
    return response.data;
  }

  async deleteComment(commentId: string) {
    let response = await this.api.delete(`/${commentId}`, {
      params: {
        access_token: this.token
      }
    });
    return response.data;
  }

  async hideComment(commentId: string, hide: boolean) {
    let response = await this.api.post(`/${commentId}`, null, {
      params: {
        hide,
        access_token: this.token
      }
    });
    return response.data;
  }

  async toggleComments(mediaId: string, enabled: boolean) {
    let response = await this.api.post(`/${mediaId}`, null, {
      params: {
        comment_enabled: enabled,
        access_token: this.token
      }
    });
    return response.data;
  }

  // ─── Insights ────────────────────────────────────────────

  async getAccountInsights(
    userId: string,
    options: {
      metrics: string[];
      period: string;
      since?: string;
      until?: string;
    }
  ) {
    let response = await this.api.get(`/${userId}/insights`, {
      params: {
        metric: options.metrics.join(','),
        period: options.period,
        since: options.since,
        until: options.until,
        access_token: this.token
      }
    });
    return response.data;
  }

  async getMediaInsights(mediaId: string, metrics: string[]) {
    let response = await this.api.get(`/${mediaId}/insights`, {
      params: {
        metric: metrics.join(','),
        access_token: this.token
      }
    });
    return response.data;
  }

  // ─── Hashtag Search ──────────────────────────────────────

  async searchHashtag(userId: string, hashtag: string) {
    let response = await this.api.get('/ig_hashtag_search', {
      params: {
        q: hashtag,
        user_id: userId,
        access_token: this.token
      }
    });
    return response.data;
  }

  async getHashtagRecentMedia(hashtagId: string, userId: string, fields?: string) {
    let defaultFields =
      'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count';
    let response = await this.api.get(`/${hashtagId}/recent_media`, {
      params: {
        user_id: userId,
        fields: fields || defaultFields,
        access_token: this.token
      }
    });
    return response.data;
  }

  async getHashtagTopMedia(hashtagId: string, userId: string, fields?: string) {
    let defaultFields =
      'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count';
    let response = await this.api.get(`/${hashtagId}/top_media`, {
      params: {
        user_id: userId,
        fields: fields || defaultFields,
        access_token: this.token
      }
    });
    return response.data;
  }

  // ─── Business Discovery ──────────────────────────────────

  async businessDiscovery(userId: string, targetUsername: string, fields?: string) {
    let defaultFields =
      'username,name,biography,ig_id,followers_count,follows_count,media_count,profile_picture_url,website,media{id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count}';
    let response = await this.api.get(`/${userId}`, {
      params: {
        fields: `business_discovery.username(${targetUsername}){${fields || defaultFields}}`,
        access_token: this.token
      }
    });
    return response.data.business_discovery;
  }

  // ─── Mentions ────────────────────────────────────────────

  async getMentionedMedia(userId: string, options?: { limit?: number; after?: string }) {
    let response = await this.api.get(`/${userId}/tags`, {
      params: {
        fields: 'id,caption,media_type,media_url,permalink,timestamp,username',
        limit: options?.limit || 25,
        after: options?.after,
        access_token: this.token
      }
    });
    return response.data;
  }

  async getMentionedComment(userId: string, commentId: string) {
    let response = await this.api.get(`/${userId}/mentioned_comment`, {
      params: {
        comment_id: commentId,
        fields: 'id,text,timestamp',
        access_token: this.token
      }
    });
    return response.data;
  }

  async getMentionedMedia2(userId: string, mediaId: string) {
    let response = await this.api.get(`/${userId}/mentioned_media`, {
      params: {
        media_id: mediaId,
        fields: 'id,caption,media_type,media_url,permalink,timestamp',
        access_token: this.token
      }
    });
    return response.data;
  }

  // ─── Messaging ───────────────────────────────────────────

  async sendMessage(
    userId: string,
    recipientId: string,
    message: {
      text?: string;
      imageUrl?: string;
      mediaId?: string;
    }
  ) {
    let messagePayload: Record<string, any> = {};

    if (message.text) {
      messagePayload.text = message.text;
    } else if (message.imageUrl) {
      messagePayload.attachment = {
        type: 'image',
        payload: { url: message.imageUrl }
      };
    }

    let body: Record<string, any> = {
      recipient: { id: recipientId },
      message: messagePayload,
      access_token: this.token
    };

    let response = await this.api.post(`/${userId}/messages`, body);
    return response.data;
  }

  async sendPrivateReply(commentId: string, message: string) {
    let response = await this.api.post(`/me/messages`, {
      recipient: { comment_id: commentId },
      message: { text: message },
      access_token: this.token
    });
    return response.data;
  }

  // ─── Stories ─────────────────────────────────────────────

  async getStories(userId: string) {
    let response = await this.api.get(`/${userId}/stories`, {
      params: {
        fields: 'id,media_type,media_url,timestamp,permalink',
        access_token: this.token
      }
    });
    return response.data;
  }

  // ─── Conversations ──────────────────────────────────────

  async getConversations(userId: string, options?: { after?: string }) {
    let response = await this.api.get(`/${userId}/conversations`, {
      params: {
        platform: 'instagram',
        fields: 'id,updated_time,participants,messages{id,message,from,to,created_time}',
        after: options?.after,
        access_token: this.token
      }
    });
    return response.data;
  }
}
