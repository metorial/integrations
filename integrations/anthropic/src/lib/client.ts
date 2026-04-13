import { createAxios } from 'slates';
import type { AxiosInstance } from 'axios';

export interface BatchResult {
  batchId: string;
  type?: string;
  processingStatus?: string;
  requestCounts?: {
    processing: number;
    succeeded: number;
    errored: number;
    canceled: number;
    expired: number;
  };
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
  resultsUrl?: string;
}

export class AnthropicClient {
  private axios: AxiosInstance;

  constructor(private config: { token: string; apiVersion: string }) {
    this.axios = createAxios({
      baseURL: 'https://api.anthropic.com',
      headers: {
        'x-api-key': config.token,
        'anthropic-version': config.apiVersion,
        'content-type': 'application/json'
      }
    });
  }

  // ---- Messages API ----

  async createMessage(params: {
    model: string;
    maxTokens: number;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string | Array<Record<string, unknown>>;
    }>;
    system?: string;
    temperature?: number;
    topK?: number;
    topP?: number;
    stopSequences?: string[];
    tools?: Array<Record<string, unknown>>;
    toolChoice?: Record<string, unknown>;
    thinking?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<Record<string, unknown>> {
    let body: Record<string, unknown> = {
      model: params.model,
      max_tokens: params.maxTokens,
      messages: params.messages
    };

    if (params.system !== undefined) body.system = params.system;
    if (params.temperature !== undefined) body.temperature = params.temperature;
    if (params.topK !== undefined) body.top_k = params.topK;
    if (params.topP !== undefined) body.top_p = params.topP;
    if (params.stopSequences !== undefined) body.stop_sequences = params.stopSequences;
    if (params.tools !== undefined) body.tools = params.tools;
    if (params.toolChoice !== undefined) body.tool_choice = params.toolChoice;
    if (params.thinking !== undefined) body.thinking = params.thinking;
    if (params.metadata !== undefined) body.metadata = params.metadata;

    let response = await this.axios.post('/v1/messages', body);
    return response.data;
  }

  // ---- Token Counting ----

  async countTokens(params: {
    model: string;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string | Array<Record<string, unknown>>;
    }>;
    system?: string;
    tools?: Array<Record<string, unknown>>;
    thinking?: Record<string, unknown>;
  }): Promise<{ inputTokens: number }> {
    let body: Record<string, unknown> = {
      model: params.model,
      messages: params.messages
    };

    if (params.system !== undefined) body.system = params.system;
    if (params.tools !== undefined) body.tools = params.tools;
    if (params.thinking !== undefined) body.thinking = params.thinking;

    let response = await this.axios.post('/v1/messages/count_tokens', body);
    return { inputTokens: response.data.input_tokens };
  }

  // ---- Models API ----

  async listModels(params?: {
    limit?: number;
    afterId?: string;
  }): Promise<{
    models: Array<Record<string, unknown>>;
    hasMore: boolean;
    firstId?: string;
    lastId?: string;
  }> {
    let queryParams: Record<string, string> = {};
    if (params?.limit !== undefined) queryParams.limit = String(params.limit);
    if (params?.afterId !== undefined) queryParams.after_id = params.afterId;

    let response = await this.axios.get('/v1/models', { params: queryParams });
    return {
      models: response.data.data,
      hasMore: response.data.has_more,
      firstId: response.data.first_id,
      lastId: response.data.last_id
    };
  }

  async getModel(modelId: string): Promise<Record<string, unknown>> {
    let response = await this.axios.get(`/v1/models/${modelId}`);
    return response.data;
  }

  // ---- Message Batches API ----

  async createMessageBatch(
    requests: Array<{
      customId: string;
      params: Record<string, unknown>;
    }>
  ): Promise<BatchResult> {
    let body = {
      requests: requests.map(r => ({
        custom_id: r.customId,
        params: r.params
      }))
    };

    let response = await this.axios.post('/v1/messages/batches', body);
    return this.normalizeBatch(response.data);
  }

  async getMessageBatch(batchId: string): Promise<BatchResult> {
    let response = await this.axios.get(`/v1/messages/batches/${batchId}`);
    return this.normalizeBatch(response.data);
  }

  async listMessageBatches(params?: {
    limit?: number;
    afterId?: string;
  }): Promise<{ batches: Array<BatchResult>; hasMore: boolean }> {
    let queryParams: Record<string, string> = {};
    if (params?.limit !== undefined) queryParams.limit = String(params.limit);
    if (params?.afterId !== undefined) queryParams.after_id = params.afterId;

    let response = await this.axios.get('/v1/messages/batches', { params: queryParams });
    return {
      batches: (response.data.data as Array<Record<string, unknown>>).map(
        (b: Record<string, unknown>) => this.normalizeBatch(b)
      ),
      hasMore: response.data.has_more
    };
  }

  async cancelMessageBatch(batchId: string): Promise<BatchResult> {
    let response = await this.axios.post(`/v1/messages/batches/${batchId}/cancel`);
    return this.normalizeBatch(response.data);
  }

  private normalizeBatch(data: Record<string, unknown>): BatchResult {
    let counts = data.request_counts as
      | {
          processing: number;
          succeeded: number;
          errored: number;
          canceled: number;
          expired: number;
        }
      | undefined;
    return {
      batchId: data.id as string,
      type: data.type as string | undefined,
      processingStatus: data.processing_status as string | undefined,
      requestCounts: counts,
      createdAt: data.created_at as string | undefined,
      updatedAt: data.updated_at as string | undefined,
      expiresAt: data.expires_at as string | undefined,
      resultsUrl: data.results_url as string | undefined
    };
  }

  // ---- Admin API: Organization ----

  async getOrganization(): Promise<Record<string, unknown>> {
    let response = await this.axios.get('/v1/organizations/me');
    return response.data;
  }

  // ---- Admin API: Members ----

  async listMembers(params?: {
    limit?: number;
    afterId?: string;
  }): Promise<{ members: Array<Record<string, unknown>>; hasMore: boolean }> {
    let queryParams: Record<string, string> = {};
    if (params?.limit !== undefined) queryParams.limit = String(params.limit);
    if (params?.afterId !== undefined) queryParams.after_id = params.afterId;

    let response = await this.axios.get('/v1/organizations/users', { params: queryParams });
    return {
      members: response.data.data,
      hasMore: response.data.has_more
    };
  }

  async updateMember(userId: string, role: string): Promise<Record<string, unknown>> {
    let response = await this.axios.post(`/v1/organizations/users/${userId}`, { role });
    return response.data;
  }

  async removeMember(userId: string): Promise<void> {
    await this.axios.delete(`/v1/organizations/users/${userId}`);
  }

  // ---- Admin API: Invites ----

  async createInvite(email: string, role: string): Promise<Record<string, unknown>> {
    let response = await this.axios.post('/v1/organizations/invites', { email, role });
    return response.data;
  }

  async listInvites(params?: {
    limit?: number;
    afterId?: string;
  }): Promise<{ invites: Array<Record<string, unknown>>; hasMore: boolean }> {
    let queryParams: Record<string, string> = {};
    if (params?.limit !== undefined) queryParams.limit = String(params.limit);
    if (params?.afterId !== undefined) queryParams.after_id = params.afterId;

    let response = await this.axios.get('/v1/organizations/invites', { params: queryParams });
    return {
      invites: response.data.data,
      hasMore: response.data.has_more
    };
  }

  async deleteInvite(inviteId: string): Promise<void> {
    await this.axios.delete(`/v1/organizations/invites/${inviteId}`);
  }

  // ---- Admin API: Workspaces ----

  async createWorkspace(
    name: string,
    params?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    let response = await this.axios.post('/v1/organizations/workspaces', { name, ...params });
    return response.data;
  }

  async listWorkspaces(params?: {
    limit?: number;
    afterId?: string;
    includeArchived?: boolean;
  }): Promise<{ workspaces: Array<Record<string, unknown>>; hasMore: boolean }> {
    let queryParams: Record<string, string> = {};
    if (params?.limit !== undefined) queryParams.limit = String(params.limit);
    if (params?.afterId !== undefined) queryParams.after_id = params.afterId;
    if (params?.includeArchived !== undefined)
      queryParams.include_archived = String(params.includeArchived);

    let response = await this.axios.get('/v1/organizations/workspaces', {
      params: queryParams
    });
    return {
      workspaces: response.data.data,
      hasMore: response.data.has_more
    };
  }

  async getWorkspace(workspaceId: string): Promise<Record<string, unknown>> {
    let response = await this.axios.get(`/v1/organizations/workspaces/${workspaceId}`);
    return response.data;
  }

  async updateWorkspace(
    workspaceId: string,
    params: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    let response = await this.axios.post(
      `/v1/organizations/workspaces/${workspaceId}`,
      params
    );
    return response.data;
  }

  async archiveWorkspace(workspaceId: string): Promise<Record<string, unknown>> {
    let response = await this.axios.post(`/v1/organizations/workspaces/${workspaceId}`, {
      is_archived: true
    });
    return response.data;
  }

  // ---- Admin API: Workspace Members ----

  async addWorkspaceMember(
    workspaceId: string,
    userId: string,
    role: string
  ): Promise<Record<string, unknown>> {
    let response = await this.axios.post(
      `/v1/organizations/workspaces/${workspaceId}/members`,
      {
        user_id: userId,
        workspace_role: role
      }
    );
    return response.data;
  }

  async listWorkspaceMembers(
    workspaceId: string,
    params?: {
      limit?: number;
      afterId?: string;
    }
  ): Promise<{ members: Array<Record<string, unknown>>; hasMore: boolean }> {
    let queryParams: Record<string, string> = {};
    if (params?.limit !== undefined) queryParams.limit = String(params.limit);
    if (params?.afterId !== undefined) queryParams.after_id = params.afterId;

    let response = await this.axios.get(
      `/v1/organizations/workspaces/${workspaceId}/members`,
      { params: queryParams }
    );
    return {
      members: response.data.data,
      hasMore: response.data.has_more
    };
  }

  async updateWorkspaceMember(
    workspaceId: string,
    userId: string,
    role: string
  ): Promise<Record<string, unknown>> {
    let response = await this.axios.post(
      `/v1/organizations/workspaces/${workspaceId}/members/${userId}`,
      {
        workspace_role: role
      }
    );
    return response.data;
  }

  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
    await this.axios.delete(`/v1/organizations/workspaces/${workspaceId}/members/${userId}`);
  }

  // ---- Admin API: API Keys ----

  async listApiKeys(params?: {
    limit?: number;
    afterId?: string;
    status?: string;
    workspaceId?: string;
  }): Promise<{ apiKeys: Array<Record<string, unknown>>; hasMore: boolean }> {
    let queryParams: Record<string, string> = {};
    if (params?.limit !== undefined) queryParams.limit = String(params.limit);
    if (params?.afterId !== undefined) queryParams.after_id = params.afterId;
    if (params?.status !== undefined) queryParams.status = params.status;
    if (params?.workspaceId !== undefined) queryParams.workspace_id = params.workspaceId;

    let response = await this.axios.get('/v1/organizations/api_keys', { params: queryParams });
    return {
      apiKeys: response.data.data,
      hasMore: response.data.has_more
    };
  }

  async updateApiKey(
    apiKeyId: string,
    params: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    let response = await this.axios.post(`/v1/organizations/api_keys/${apiKeyId}`, params);
    return response.data;
  }
}
