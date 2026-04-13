import { createAxios } from 'slates';
import type { AxiosInstance } from 'axios';

export interface ConfluenceClientConfig {
  token: string;
  cloudId?: string;
  baseUrl?: string;
  authType: 'oauth' | 'basic' | 'bearer';
}

export interface V2PaginatedResponse<T> {
  results: T[];
  _links?: { next?: string };
}

export interface V1PaginatedResponse<T> {
  results: T[];
  start?: number;
  limit?: number;
  size?: number;
  _links?: { next?: string };
}

export interface ConfluencePage {
  id: string;
  type?: string;
  status: string;
  title: string;
  spaceId?: string;
  parentId?: string;
  authorId?: string;
  createdAt?: string;
  version?: { number: number; message?: string; createdAt?: string };
  body?: {
    storage?: { value: string; representation: string };
  };
  _links?: { webui?: string; tinyui?: string };
}

export interface ConfluenceBlogPost {
  id: string;
  status: string;
  title: string;
  spaceId?: string;
  authorId?: string;
  createdAt?: string;
  version?: { number: number; message?: string; createdAt?: string };
  body?: {
    storage?: { value: string; representation: string };
  };
  _links?: { webui?: string };
}

export interface ConfluenceSpace {
  id: string;
  key: string;
  name: string;
  type?: string;
  status?: string;
  description?: { plain?: { value: string }; view?: { value: string } };
  homepageId?: string;
  _links?: { webui?: string };
}

export interface ConfluenceComment {
  id: string;
  status: string;
  title?: string;
  pageId?: string;
  blogPostId?: string;
  parentCommentId?: string;
  authorId?: string;
  createdAt?: string;
  version?: { number: number; createdAt?: string };
  body?: { storage?: { value: string; representation: string } };
}

export interface ConfluenceAttachment {
  id: string;
  status: string;
  title: string;
  mediaType?: string;
  fileSize?: number;
  pageId?: string;
  blogPostId?: string;
  version?: { number: number; createdAt?: string };
  downloadLink?: string;
}

export interface ConfluenceLabel {
  id?: string;
  prefix: string;
  name: string;
}

export interface ConfluenceSearchResult {
  content?: {
    id: string;
    type: string;
    status: string;
    title: string;
    space?: { key: string; name: string };
    _links?: { webui?: string };
  };
  title?: string;
  excerpt?: string;
  url?: string;
  resultGlobalContainer?: { title: string; displayUrl: string };
}

export interface ConfluenceUser {
  type?: string;
  accountId?: string;
  accountType?: string;
  email?: string;
  publicName?: string;
  displayName?: string;
  profilePicture?: { path: string };
}

export interface ConfluenceGroup {
  type?: string;
  name: string;
  id?: string;
}

export interface ContentProperty {
  id: string;
  key: string;
  value: any;
  version?: { number: number };
}

export class ConfluenceClient {
  private ax: AxiosInstance;

  constructor(private clientConfig: ConfluenceClientConfig) {
    let isCloud = !!clientConfig.cloudId;

    let baseURL: string;
    if (isCloud && clientConfig.cloudId) {
      baseURL = `https://api.atlassian.com/ex/confluence/${clientConfig.cloudId}`;
    } else if (clientConfig.baseUrl) {
      baseURL = clientConfig.baseUrl.replace(/\/$/, '');
    } else {
      throw new Error(
        'Either cloudId (for Cloud) or baseUrl (for Data Center) must be provided.'
      );
    }

    let headers: Record<string, string> = {};
    if (clientConfig.authType === 'oauth') {
      headers['Authorization'] = `Bearer ${clientConfig.token}`;
    } else if (clientConfig.authType === 'basic') {
      headers['Authorization'] = `Basic ${clientConfig.token}`;
    } else if (clientConfig.authType === 'bearer') {
      headers['Authorization'] = `Bearer ${clientConfig.token}`;
    }

    this.ax = createAxios({
      baseURL,
      headers
    });
  }

  // ── Pages (v2 API) ──

  async getPages(
    params: {
      spaceId?: string;
      title?: string;
      status?: string;
      limit?: number;
      cursor?: string;
      sort?: string;
    } = {}
  ): Promise<V2PaginatedResponse<ConfluencePage>> {
    let queryParams: Record<string, string> = {};
    if (params.spaceId) queryParams['space-id'] = params.spaceId;
    if (params.title) queryParams['title'] = params.title;
    if (params.status) queryParams['status'] = params.status;
    if (params.limit) queryParams['limit'] = String(params.limit);
    if (params.cursor) queryParams['cursor'] = params.cursor;
    if (params.sort) queryParams['sort'] = params.sort;

    let response = await this.ax.get('/api/v2/pages', { params: queryParams });
    return response.data;
  }

  async getPageById(pageId: string, includeBody: boolean = false): Promise<ConfluencePage> {
    let params: Record<string, string> = {};
    if (includeBody) params['body-format'] = 'storage';

    let response = await this.ax.get(`/api/v2/pages/${pageId}`, { params });
    return response.data;
  }

  async createPage(data: {
    spaceId: string;
    title: string;
    body: string;
    parentId?: string;
    status?: string;
  }): Promise<ConfluencePage> {
    let payload: any = {
      spaceId: data.spaceId,
      status: data.status || 'current',
      title: data.title,
      body: {
        representation: 'storage',
        value: data.body
      }
    };

    if (data.parentId) {
      payload.parentId = data.parentId;
    }

    let response = await this.ax.post('/api/v2/pages', payload);
    return response.data;
  }

  async updatePage(
    pageId: string,
    data: {
      title?: string;
      body?: string;
      version: number;
      status?: string;
      message?: string;
    }
  ): Promise<ConfluencePage> {
    let payload: any = {
      id: pageId,
      status: data.status || 'current',
      version: {
        number: data.version,
        message: data.message
      }
    };

    if (data.title) payload.title = data.title;
    if (data.body !== undefined) {
      payload.body = {
        representation: 'storage',
        value: data.body
      };
    }

    let response = await this.ax.put(`/api/v2/pages/${pageId}`, payload);
    return response.data;
  }

  async deletePage(pageId: string): Promise<void> {
    await this.ax.delete(`/api/v2/pages/${pageId}`);
  }

  async getPageChildren(
    pageId: string,
    params: {
      limit?: number;
      cursor?: string;
    } = {}
  ): Promise<V2PaginatedResponse<ConfluencePage>> {
    let queryParams: Record<string, string> = {};
    if (params.limit) queryParams['limit'] = String(params.limit);
    if (params.cursor) queryParams['cursor'] = params.cursor;

    let response = await this.ax.get(`/api/v2/pages/${pageId}/children`, {
      params: queryParams
    });
    return response.data;
  }

  // ── Blog Posts (v2 API) ──

  async getBlogPosts(
    params: {
      spaceId?: string;
      title?: string;
      status?: string;
      limit?: number;
      cursor?: string;
      sort?: string;
    } = {}
  ): Promise<V2PaginatedResponse<ConfluenceBlogPost>> {
    let queryParams: Record<string, string> = {};
    if (params.spaceId) queryParams['space-id'] = params.spaceId;
    if (params.title) queryParams['title'] = params.title;
    if (params.status) queryParams['status'] = params.status;
    if (params.limit) queryParams['limit'] = String(params.limit);
    if (params.cursor) queryParams['cursor'] = params.cursor;
    if (params.sort) queryParams['sort'] = params.sort;

    let response = await this.ax.get('/api/v2/blogposts', { params: queryParams });
    return response.data;
  }

  async getBlogPostById(
    blogPostId: string,
    includeBody: boolean = false
  ): Promise<ConfluenceBlogPost> {
    let params: Record<string, string> = {};
    if (includeBody) params['body-format'] = 'storage';

    let response = await this.ax.get(`/api/v2/blogposts/${blogPostId}`, { params });
    return response.data;
  }

  async createBlogPost(data: {
    spaceId: string;
    title: string;
    body: string;
    status?: string;
  }): Promise<ConfluenceBlogPost> {
    let response = await this.ax.post('/api/v2/blogposts', {
      spaceId: data.spaceId,
      status: data.status || 'current',
      title: data.title,
      body: {
        representation: 'storage',
        value: data.body
      }
    });
    return response.data;
  }

  async updateBlogPost(
    blogPostId: string,
    data: {
      title?: string;
      body?: string;
      version: number;
      status?: string;
    }
  ): Promise<ConfluenceBlogPost> {
    let payload: any = {
      id: blogPostId,
      status: data.status || 'current',
      version: {
        number: data.version
      }
    };

    if (data.title) payload.title = data.title;
    if (data.body !== undefined) {
      payload.body = {
        representation: 'storage',
        value: data.body
      };
    }

    let response = await this.ax.put(`/api/v2/blogposts/${blogPostId}`, payload);
    return response.data;
  }

  async deleteBlogPost(blogPostId: string): Promise<void> {
    await this.ax.delete(`/api/v2/blogposts/${blogPostId}`);
  }

  // ── Spaces (v2 API) ──

  async getSpaces(
    params: {
      keys?: string[];
      type?: string;
      status?: string;
      limit?: number;
      cursor?: string;
      sort?: string;
    } = {}
  ): Promise<V2PaginatedResponse<ConfluenceSpace>> {
    let queryParams: Record<string, string> = {};
    if (params.keys && params.keys.length > 0) queryParams['keys'] = params.keys.join(',');
    if (params.type) queryParams['type'] = params.type;
    if (params.status) queryParams['status'] = params.status;
    if (params.limit) queryParams['limit'] = String(params.limit);
    if (params.cursor) queryParams['cursor'] = params.cursor;
    if (params.sort) queryParams['sort'] = params.sort;

    let response = await this.ax.get('/api/v2/spaces', { params: queryParams });
    return response.data;
  }

  async getSpaceById(spaceId: string): Promise<ConfluenceSpace> {
    let response = await this.ax.get(`/api/v2/spaces/${spaceId}`);
    return response.data;
  }

  // ── Comments (v2 API) ──

  async getPageFooterComments(
    pageId: string,
    params: {
      limit?: number;
      cursor?: string;
    } = {}
  ): Promise<V2PaginatedResponse<ConfluenceComment>> {
    let queryParams: Record<string, string> = { 'body-format': 'storage' };
    if (params.limit) queryParams['limit'] = String(params.limit);
    if (params.cursor) queryParams['cursor'] = params.cursor;

    let response = await this.ax.get(`/api/v2/pages/${pageId}/footer-comments`, {
      params: queryParams
    });
    return response.data;
  }

  async createPageFooterComment(pageId: string, body: string): Promise<ConfluenceComment> {
    let response = await this.ax.post(`/api/v2/pages/${pageId}/footer-comments`, {
      body: {
        representation: 'storage',
        value: body
      }
    });
    return response.data;
  }

  async createBlogPostFooterComment(
    blogPostId: string,
    body: string
  ): Promise<ConfluenceComment> {
    let response = await this.ax.post(`/api/v2/blogposts/${blogPostId}/footer-comments`, {
      body: {
        representation: 'storage',
        value: body
      }
    });
    return response.data;
  }

  async deleteFooterComment(commentId: string): Promise<void> {
    await this.ax.delete(`/api/v2/footer-comments/${commentId}`);
  }

  async deleteInlineComment(commentId: string): Promise<void> {
    await this.ax.delete(`/api/v2/inline-comments/${commentId}`);
  }

  // ── Labels (v1 API) ──

  async getContentLabels(contentId: string): Promise<V1PaginatedResponse<ConfluenceLabel>> {
    let response = await this.ax.get(`/wiki/rest/api/content/${contentId}/label`);
    return response.data;
  }

  async addContentLabels(contentId: string, labels: string[]): Promise<ConfluenceLabel[]> {
    let payload = labels.map(name => ({ prefix: 'global', name }));
    let response = await this.ax.post(`/wiki/rest/api/content/${contentId}/label`, payload);
    return response.data.results || response.data;
  }

  async removeContentLabel(contentId: string, label: string): Promise<void> {
    await this.ax.delete(
      `/wiki/rest/api/content/${contentId}/label/${encodeURIComponent(label)}`
    );
  }

  // ── Search (v1 API with CQL) ──

  async search(params: {
    cql: string;
    cqlContext?: string;
    limit?: number;
    start?: number;
    includeArchivedSpaces?: boolean;
    excerpt?: string;
  }): Promise<V1PaginatedResponse<ConfluenceSearchResult>> {
    let queryParams: Record<string, string> = {
      cql: params.cql
    };
    if (params.cqlContext) queryParams['cqlcontext'] = params.cqlContext;
    if (params.limit) queryParams['limit'] = String(params.limit);
    if (params.start) queryParams['start'] = String(params.start);
    if (params.includeArchivedSpaces !== undefined) {
      queryParams['includeArchivedSpaces'] = String(params.includeArchivedSpaces);
    }
    if (params.excerpt) queryParams['excerpt'] = params.excerpt;

    let response = await this.ax.get('/wiki/rest/api/search', { params: queryParams });
    return response.data;
  }

  // ── Content Properties (v2 API) ──

  async getPageProperties(pageId: string): Promise<V2PaginatedResponse<ContentProperty>> {
    let response = await this.ax.get(`/api/v2/pages/${pageId}/properties`);
    return response.data;
  }

  async createPageProperty(pageId: string, key: string, value: any): Promise<ContentProperty> {
    let response = await this.ax.post(`/api/v2/pages/${pageId}/properties`, { key, value });
    return response.data;
  }

  async updatePageProperty(
    pageId: string,
    propertyId: string,
    key: string,
    value: any,
    version: number
  ): Promise<ContentProperty> {
    let response = await this.ax.put(`/api/v2/pages/${pageId}/properties/${propertyId}`, {
      key,
      value,
      version: { number: version }
    });
    return response.data;
  }

  async deletePageProperty(pageId: string, propertyId: string): Promise<void> {
    await this.ax.delete(`/api/v2/pages/${pageId}/properties/${propertyId}`);
  }

  // ── Attachments (v2 API) ──

  async getPageAttachments(
    pageId: string,
    params: {
      limit?: number;
      cursor?: string;
    } = {}
  ): Promise<V2PaginatedResponse<ConfluenceAttachment>> {
    let queryParams: Record<string, string> = {};
    if (params.limit) queryParams['limit'] = String(params.limit);
    if (params.cursor) queryParams['cursor'] = params.cursor;

    let response = await this.ax.get(`/api/v2/pages/${pageId}/attachments`, {
      params: queryParams
    });
    return response.data;
  }

  // ── Content Restrictions (v1 API) ──

  async getContentRestrictions(contentId: string): Promise<any> {
    let response = await this.ax.get(`/wiki/rest/api/content/${contentId}/restriction`);
    return response.data;
  }

  async updateContentRestrictions(
    contentId: string,
    restrictions: Array<{
      operation: 'read' | 'update';
      users?: string[];
      groups?: string[];
    }>
  ): Promise<any> {
    let payload = restrictions.map(r => ({
      operation: r.operation,
      restrictions: {
        user: (r.users || []).map(accountId => ({ type: 'known', accountId })),
        group: (r.groups || []).map(name => ({ type: 'group', name }))
      }
    }));

    let response = await this.ax.put(
      `/wiki/rest/api/content/${contentId}/restriction`,
      payload
    );
    return response.data;
  }

  async deleteContentRestrictions(contentId: string): Promise<void> {
    await this.ax.delete(`/wiki/rest/api/content/${contentId}/restriction`);
  }

  // ── Users & Groups (v1 API) ──

  async getCurrentUser(): Promise<ConfluenceUser> {
    let response = await this.ax.get('/wiki/rest/api/user/current');
    return response.data;
  }

  async getUserByAccountId(accountId: string): Promise<ConfluenceUser> {
    let response = await this.ax.get('/wiki/rest/api/user', { params: { accountId } });
    return response.data;
  }

  async getGroups(
    params: {
      limit?: number;
      start?: number;
    } = {}
  ): Promise<V1PaginatedResponse<ConfluenceGroup>> {
    let queryParams: Record<string, string> = {};
    if (params.limit) queryParams['limit'] = String(params.limit);
    if (params.start) queryParams['start'] = String(params.start);

    let response = await this.ax.get('/wiki/rest/api/group', { params: queryParams });
    return response.data;
  }

  async getGroupMembers(
    groupName: string,
    params: {
      limit?: number;
      start?: number;
    } = {}
  ): Promise<V1PaginatedResponse<ConfluenceUser>> {
    let queryParams: Record<string, string> = {};
    if (params.limit) queryParams['limit'] = String(params.limit);
    if (params.start) queryParams['start'] = String(params.start);

    let response = await this.ax.get(
      `/wiki/rest/api/group/${encodeURIComponent(groupName)}/member`,
      { params: queryParams }
    );
    return response.data;
  }

  // ── Content Version History (v1 API) ──

  async getContentVersions(
    contentId: string,
    params: {
      limit?: number;
      start?: number;
    } = {}
  ): Promise<V1PaginatedResponse<any>> {
    let queryParams: Record<string, string> = {};
    if (params.limit) queryParams['limit'] = String(params.limit);
    if (params.start) queryParams['start'] = String(params.start);

    let response = await this.ax.get(`/wiki/rest/api/content/${contentId}/version`, {
      params: queryParams
    });
    return response.data;
  }

  // ── Webhooks (Cloud REST API) ──

  async registerWebhook(data: {
    name: string;
    url: string;
    events: string[];
    active?: boolean;
  }): Promise<any> {
    let response = await this.ax.post('/wiki/rest/webhooks/1.0/webhook', {
      ...data,
      active: data.active !== false
    });
    return response.data;
  }

  async unregisterWebhook(webhookId: string): Promise<void> {
    await this.ax.delete(`/wiki/rest/webhooks/1.0/webhook/${webhookId}`);
  }
}
