import { createAxios } from 'slates';

export class TypeformClient {
  private axios: ReturnType<typeof createAxios>;

  constructor(config: { token: string; baseUrl: string }) {
    this.axios = createAxios({
      baseURL: config.baseUrl,
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // ─── Account ──────────────────────────────────────────────────

  async getAccount(): Promise<any> {
    let response = await this.axios.get('/me');
    return response.data;
  }

  // ─── Forms ────────────────────────────────────────────────────

  async listForms(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
    workspaceId?: string;
    sort?: string;
  }): Promise<any> {
    let query: Record<string, any> = {};
    if (params?.search) query.search = params.search;
    if (params?.page) query.page = params.page;
    if (params?.pageSize) query.page_size = params.pageSize;
    if (params?.workspaceId) query.workspace_id = params.workspaceId;
    if (params?.sort) query.sort_by = params.sort;

    let response = await this.axios.get('/forms', { params: query });
    return response.data;
  }

  async getForm(formId: string): Promise<any> {
    let response = await this.axios.get(`/forms/${formId}`);
    return response.data;
  }

  async createForm(formData: any): Promise<any> {
    let response = await this.axios.post('/forms', formData);
    return response.data;
  }

  async updateForm(formId: string, formData: any): Promise<any> {
    let response = await this.axios.put(`/forms/${formId}`, formData);
    return response.data;
  }

  async patchForm(formId: string, operations: any[]): Promise<any> {
    let response = await this.axios.patch(`/forms/${formId}`, operations);
    return response.data;
  }

  async deleteForm(formId: string): Promise<void> {
    await this.axios.delete(`/forms/${formId}`);
  }

  async getFormMessages(formId: string): Promise<any> {
    let response = await this.axios.get(`/forms/${formId}/messages`);
    return response.data;
  }

  async updateFormMessages(formId: string, messages: any): Promise<void> {
    await this.axios.put(`/forms/${formId}/messages`, messages);
  }

  // ─── Responses ────────────────────────────────────────────────

  async getResponses(formId: string, params?: {
    pageSize?: number;
    since?: string;
    until?: string;
    after?: string;
    before?: string;
    includedResponseIds?: string;
    completed?: boolean;
    sort?: string;
    query?: string;
    fields?: string[];
    responseType?: string;
  }): Promise<any> {
    let query: Record<string, any> = {};
    if (params?.pageSize) query.page_size = params.pageSize;
    if (params?.since) query.since = params.since;
    if (params?.until) query.until = params.until;
    if (params?.after) query.after = params.after;
    if (params?.before) query.before = params.before;
    if (params?.includedResponseIds) query.included_response_ids = params.includedResponseIds;
    if (params?.completed !== undefined) query.completed = params.completed;
    if (params?.sort) query.sort = params.sort;
    if (params?.query) query.query = params.query;
    if (params?.fields) query.fields = params.fields.join(',');
    if (params?.responseType) query.response_type = params.responseType;

    let response = await this.axios.get(`/forms/${formId}/responses`, { params: query });
    return response.data;
  }

  async deleteResponses(formId: string, includedTokens: string[]): Promise<void> {
    await this.axios.delete(`/forms/${formId}/responses`, {
      params: { included_tokens: includedTokens.join(',') },
    });
  }

  // ─── Workspaces ───────────────────────────────────────────────

  async listWorkspaces(params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<any> {
    let query: Record<string, any> = {};
    if (params?.search) query.search = params.search;
    if (params?.page) query.page = params.page;
    if (params?.pageSize) query.page_size = params.pageSize;

    let response = await this.axios.get('/workspaces', { params: query });
    return response.data;
  }

  async getWorkspace(workspaceId: string): Promise<any> {
    let response = await this.axios.get(`/workspaces/${workspaceId}`);
    return response.data;
  }

  async createWorkspace(name: string): Promise<any> {
    let response = await this.axios.post('/workspaces', { name });
    return response.data;
  }

  async updateWorkspace(workspaceId: string, operations: any[]): Promise<any> {
    let response = await this.axios.patch(`/workspaces/${workspaceId}`, operations);
    return response.data;
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    await this.axios.delete(`/workspaces/${workspaceId}`);
  }

  // ─── Themes ───────────────────────────────────────────────────

  async listThemes(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<any> {
    let query: Record<string, any> = {};
    if (params?.page) query.page = params.page;
    if (params?.pageSize) query.page_size = params.pageSize;

    let response = await this.axios.get('/themes', { params: query });
    return response.data;
  }

  async getTheme(themeId: string): Promise<any> {
    let response = await this.axios.get(`/themes/${themeId}`);
    return response.data;
  }

  async createTheme(themeData: any): Promise<any> {
    let response = await this.axios.post('/themes', themeData);
    return response.data;
  }

  async updateTheme(themeId: string, themeData: any): Promise<any> {
    let response = await this.axios.put(`/themes/${themeId}`, themeData);
    return response.data;
  }

  async deleteTheme(themeId: string): Promise<void> {
    await this.axios.delete(`/themes/${themeId}`);
  }

  // ─── Images ───────────────────────────────────────────────────

  async listImages(): Promise<any> {
    let response = await this.axios.get('/images');
    return response.data;
  }

  async getImage(imageId: string): Promise<any> {
    let response = await this.axios.get(`/images/${imageId}`);
    return response.data;
  }

  async createImage(imageData: {
    image: string;
    mediaType: string;
    fileName: string;
  }): Promise<any> {
    let response = await this.axios.post('/images', {
      image: imageData.image,
      media_type: imageData.mediaType,
      file_name: imageData.fileName,
    });
    return response.data;
  }

  async deleteImage(imageId: string): Promise<void> {
    await this.axios.delete(`/images/${imageId}`);
  }

  // ─── Webhooks ─────────────────────────────────────────────────

  async listWebhooks(formId: string): Promise<any> {
    let response = await this.axios.get(`/forms/${formId}/webhooks`);
    return response.data;
  }

  async getWebhook(formId: string, tag: string): Promise<any> {
    let response = await this.axios.get(`/forms/${formId}/webhooks/${tag}`);
    return response.data;
  }

  async createOrUpdateWebhook(formId: string, tag: string, params: {
    url: string;
    enabled?: boolean;
    secret?: string;
    verifySsl?: boolean;
    eventTypes?: Record<string, boolean>;
  }): Promise<any> {
    let body: Record<string, any> = {
      url: params.url,
    };
    if (params.enabled !== undefined) body.enabled = params.enabled;
    if (params.secret) body.secret = params.secret;
    if (params.verifySsl !== undefined) body.verify_ssl = params.verifySsl;
    if (params.eventTypes) body.event_types = params.eventTypes;

    let response = await this.axios.put(`/forms/${formId}/webhooks/${tag}`, body);
    return response.data;
  }

  async deleteWebhook(formId: string, tag: string): Promise<void> {
    await this.axios.delete(`/forms/${formId}/webhooks/${tag}`);
  }

  // ─── Insights ─────────────────────────────────────────────────

  async getFormInsights(formId: string): Promise<any> {
    let response = await this.axios.get(`/insights/${formId}/summary`);
    return response.data;
  }

  // ─── Translations ─────────────────────────────────────────────

  async getTranslationStatuses(formId: string): Promise<any> {
    let response = await this.axios.get(`/forms/${formId}/translations/statuses`);
    return response.data;
  }

  async getTranslation(formId: string, language: string): Promise<any> {
    let response = await this.axios.get(`/forms/${formId}/translations/${language}`);
    return response.data;
  }

  async updateTranslation(formId: string, language: string, translationData: any): Promise<any> {
    let response = await this.axios.put(`/forms/${formId}/translations/${language}`, translationData);
    return response.data;
  }

  async deleteTranslation(formId: string, language: string): Promise<void> {
    await this.axios.delete(`/forms/${formId}/translations/${language}`);
  }

  async autoTranslate(formId: string, language: string): Promise<any> {
    let response = await this.axios.post(`/forms/${formId}/translations/${language}/auto`);
    return response.data;
  }
}
