import { createAxios } from 'slates';
import type { AxiosInstance } from 'axios';

let LINKEDIN_API_VERSION = '202401';

export interface LinkedInClientConfig {
  token: string;
}

export class LinkedInClient {
  private api: AxiosInstance;
  private restApi: AxiosInstance;

  constructor(private config: LinkedInClientConfig) {
    this.api = createAxios({
      baseURL: 'https://api.linkedin.com/v2',
      headers: {
        Authorization: `Bearer ${config.token}`
      }
    });

    this.restApi = createAxios({
      baseURL: 'https://api.linkedin.com/rest',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'LinkedIn-Version': LINKEDIN_API_VERSION,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
  }

  // ---- Profile ----

  async getUserInfo(): Promise<LinkedInUserInfo> {
    let response = await this.api.get('/userinfo');
    return response.data;
  }

  async getMe(): Promise<LinkedInProfile> {
    let response = await this.api.get('/me', {
      params: {
        projection: '(id,firstName,lastName,profilePicture(displayImage~:playableStreams))'
      }
    });
    return response.data;
  }

  // ---- Posts ----

  async createPost(post: CreatePostRequest): Promise<string> {
    let media: Array<Record<string, unknown>> | undefined;
    let shareMediaCategory: 'NONE' | 'ARTICLE' | 'IMAGE' = 'NONE';

    if (post.articleUrl) {
      shareMediaCategory = 'ARTICLE';
      media = [
        {
          status: 'READY',
          originalUrl: post.articleUrl,
          ...(post.articleTitle ? { title: { text: post.articleTitle } } : {}),
          ...(post.articleDescription
            ? { description: { text: post.articleDescription } }
            : {})
        }
      ];
    } else if (post.imageUrn) {
      shareMediaCategory = 'IMAGE';
      media = [
        {
          status: 'READY',
          media: post.imageUrn,
          ...(post.imageDescription ? { description: { text: post.imageDescription } } : {})
        }
      ];
    }

    let response = await this.api.post(
      '/ugcPosts',
      {
        author: post.authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: post.text
            },
            shareMediaCategory,
            ...(media ? { media } : {})
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': post.visibility
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );
    let postUrn = response.headers['x-restli-id'] || response.headers['x-linkedin-id'] || '';
    return postUrn;
  }

  async getPost(postUrn: string): Promise<LinkedInPost> {
    let response = await this.restApi.get(`/posts/${encodeURIComponent(postUrn)}`);
    return response.data;
  }

  async deletePost(postUrn: string): Promise<void> {
    await this.restApi.delete(`/posts/${encodeURIComponent(postUrn)}`);
  }

  async getPostsByAuthor(
    authorUrn: string,
    options?: PaginationOptions
  ): Promise<PaginatedResponse<LinkedInPost>> {
    let params: Record<string, string> = {
      author: authorUrn,
      q: 'author'
    };
    if (options?.count) params['count'] = String(options.count);
    if (options?.start) params['start'] = String(options.start);

    let response = await this.restApi.get('/posts', { params });
    return {
      elements: response.data.elements || [],
      paging: response.data.paging
    };
  }

  // ---- Comments ----

  async createComment(
    postUrn: string,
    comment: CreateCommentRequest
  ): Promise<LinkedInComment> {
    let response = await this.restApi.post(
      `/socialActions/${encodeURIComponent(postUrn)}/comments`,
      comment,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  }

  async getComments(
    postUrn: string,
    options?: PaginationOptions
  ): Promise<PaginatedResponse<LinkedInComment>> {
    let params: Record<string, string> = {};
    if (options?.count) params['count'] = String(options.count);
    if (options?.start) params['start'] = String(options.start);

    let response = await this.restApi.get(
      `/socialActions/${encodeURIComponent(postUrn)}/comments`,
      { params }
    );
    return {
      elements: response.data.elements || [],
      paging: response.data.paging
    };
  }

  async deleteComment(postUrn: string, commentUrn: string): Promise<void> {
    await this.restApi.delete(
      `/socialActions/${encodeURIComponent(postUrn)}/comments/${encodeURIComponent(commentUrn)}`
    );
  }

  // ---- Reactions ----

  async createReaction(postUrn: string, reactionType: string): Promise<void> {
    await this.restApi.post(
      `/socialActions/${encodeURIComponent(postUrn)}/reactions`,
      { root: postUrn, reactionType },
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  async getReactions(
    postUrn: string,
    options?: PaginationOptions
  ): Promise<PaginatedResponse<LinkedInReaction>> {
    let params: Record<string, string> = {};
    if (options?.count) params['count'] = String(options.count);
    if (options?.start) params['start'] = String(options.start);

    let response = await this.restApi.get(
      `/socialActions/${encodeURIComponent(postUrn)}/reactions`,
      { params }
    );
    return {
      elements: response.data.elements || [],
      paging: response.data.paging
    };
  }

  async deleteReaction(postUrn: string, actorUrn: string): Promise<void> {
    await this.restApi.delete(
      `/socialActions/${encodeURIComponent(postUrn)}/reactions/${encodeURIComponent(actorUrn)}`
    );
  }

  // ---- Organizations ----

  async getOrganization(organizationId: string): Promise<LinkedInOrganization> {
    let response = await this.restApi.get(
      `/organizations/${encodeURIComponent(organizationId)}`
    );
    return response.data;
  }

  async getOrganizationByVanityName(vanityName: string): Promise<LinkedInOrganization> {
    let response = await this.restApi.get('/organizations', {
      params: {
        q: 'vanityName',
        vanityName
      }
    });
    let elements = response.data.elements || [];
    if (elements.length === 0) {
      throw new Error(`Organization not found with vanity name: ${vanityName}`);
    }
    return elements[0];
  }

  async getAdministeredOrganizations(memberUrn: string): Promise<LinkedInOrganizationRole[]> {
    let response = await this.restApi.get('/organizationAcls', {
      params: {
        q: 'roleAssignee',
        role: 'ADMINISTRATOR',
        projection:
          '(elements*(organizationTarget~(id,localizedName,vanityName,logoV2(original~:playableStreams))))'
      }
    });
    return response.data.elements || [];
  }

  // ---- Organization Follower Statistics ----

  async getOrganizationFollowerStatistics(
    organizationUrn: string
  ): Promise<LinkedInFollowerStatistics> {
    let response = await this.restApi.get('/organizationalEntityFollowerStatistics', {
      params: {
        q: 'organizationalEntity',
        organizationalEntity: organizationUrn
      }
    });
    let elements = response.data.elements || [];
    return elements[0] || {};
  }

  async getOrganizationPageStatistics(
    organizationUrn: string
  ): Promise<LinkedInPageStatistics> {
    let response = await this.restApi.get('/organizationPageStatistics', {
      params: {
        q: 'organization',
        organization: organizationUrn
      }
    });
    let elements = response.data.elements || [];
    return elements[0] || {};
  }

  // ---- Image Upload ----

  async initializeImageUpload(ownerUrn: string): Promise<ImageUploadInitResponse> {
    let response = await this.api.post(
      '/assets?action=registerUpload',
      {
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: ownerUrn,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent'
            }
          ]
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );
    let value = response.data.value;
    return {
      uploadUrl:
        value.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']
          ?.uploadUrl,
      imageUrn: value.asset
    };
  }

  async uploadImageBinary(
    uploadUrl: string,
    imageData: ArrayBuffer,
    contentType: string
  ): Promise<void> {
    let client = createAxios();
    await client.put(uploadUrl, imageData, {
      headers: {
        'Content-Type': contentType,
        Authorization: `Bearer ${this.config.token}`
      }
    });
  }

  // ---- Social Actions Summary ----

  async getSocialActionSummary(postUrn: string): Promise<LinkedInSocialActionSummary> {
    let response = await this.restApi.get(`/socialActions/${encodeURIComponent(postUrn)}`);
    return response.data;
  }
}

// ---- Types ----

export interface LinkedInUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  locale?: { language: string; country: string };
}

export interface LinkedInProfile {
  id: string;
  firstName: {
    localized: Record<string, string>;
    preferredLocale: { country: string; language: string };
  };
  lastName: {
    localized: Record<string, string>;
    preferredLocale: { country: string; language: string };
  };
  profilePicture?: any;
}

export interface CreatePostRequest {
  authorUrn: string;
  text: string;
  visibility: 'PUBLIC' | 'CONNECTIONS';
  articleUrl?: string;
  articleTitle?: string;
  articleDescription?: string;
  imageUrn?: string;
  imageDescription?: string;
}

export interface LinkedInPost {
  author: string;
  commentary?: string;
  visibility: string;
  lifecycleState: string;
  publishedAt?: string;
  lastModifiedAt?: string;
  id?: string;
  content?: any;
  distribution?: any;
  isReshareDisabledByAuthor?: boolean;
}

export interface CreateCommentRequest {
  actor: string;
  message: { text: string };
  parentComment?: string;
}

export interface LinkedInComment {
  actor: string;
  message: { text: string };
  created: { actor: string; time: number };
  lastModified: { actor: string; time: number };
  $URN?: string;
  parentComment?: string;
}

export interface LinkedInReaction {
  actor: string;
  reactionType: string;
  created: { actor: string; time: number };
}

export interface LinkedInOrganization {
  id: number;
  localizedName: string;
  vanityName?: string;
  localizedDescription?: string;
  localizedWebsite?: string;
  logoV2?: any;
  coverPhotoV2?: any;
  organizationType?: string;
  industries?: string[];
  staffCountRange?: string;
  locations?: any[];
  foundedOn?: any;
}

export interface LinkedInOrganizationRole {
  role: string;
  state: string;
  organizationTarget: string;
  'organizationTarget~'?: LinkedInOrganization;
}

export interface LinkedInFollowerStatistics {
  followerCountsByAssociationType?: any[];
  followerCountsByRegion?: any[];
  followerCountsBySeniority?: any[];
  followerCountsByIndustry?: any[];
  followerCountsByFunction?: any[];
  followerCountsByStaffCountRange?: any[];
  organizationalEntity?: string;
}

export interface LinkedInPageStatistics {
  totalPageStatistics?: {
    views?: { allPageViews?: { pageViews: number }; mobilePageViews?: { pageViews: number } };
    clicks?: any;
  };
  organization?: string;
}

export interface ImageUploadInitResponse {
  uploadUrl: string;
  imageUrn: string;
}

export interface LinkedInSocialActionSummary {
  target: string;
  totalShareStatistics?: {
    shareCount?: number;
    clickCount?: number;
    engagement?: number;
    impressionCount?: number;
    likeCount?: number;
    commentCount?: number;
  };
  likes?: { aggregatedTotalLikes: number };
  comments?: { aggregatedTotalComments: number };
}

export interface PaginationOptions {
  count?: number;
  start?: number;
}

export interface PaginatedResponse<T> {
  elements: T[];
  paging?: {
    count: number;
    start: number;
    total?: number;
    links?: any[];
  };
}
