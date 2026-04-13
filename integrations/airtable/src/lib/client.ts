import { createAxios } from 'slates';
import type { AxiosInstance } from 'axios';
import type {
  AirtableRecord,
  AirtableListRecordsResponse,
  AirtableBaseSchema,
  AirtableComment,
  AirtableWebhook,
  CreateWebhookResponse,
  WebhookPayloadsResponse,
} from './types';

export class Client {
  private api: AxiosInstance;
  private baseId: string;

  constructor(config: { token: string; baseId: string }) {
    this.baseId = config.baseId;
    this.api = createAxios({
      baseURL: 'https://api.airtable.com/v0',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // ─── Records ─────────────────────────────────────────────────────────

  async listRecords(
    tableIdOrName: string,
    options?: {
      fields?: string[];
      filterByFormula?: string;
      maxRecords?: number;
      pageSize?: number;
      sort?: { field: string; direction?: 'asc' | 'desc' }[];
      view?: string;
      offset?: string;
      cellFormat?: 'json' | 'string';
      timeZone?: string;
      userLocale?: string;
      returnFieldsByFieldId?: boolean;
    }
  ): Promise<AirtableListRecordsResponse> {
    let params: Record<string, any> = {};

    if (options?.fields) {
      options.fields.forEach((field, index) => {
        params[`fields[${index}]`] = field;
      });
    }
    if (options?.filterByFormula) params['filterByFormula'] = options.filterByFormula;
    if (options?.maxRecords) params['maxRecords'] = options.maxRecords;
    if (options?.pageSize) params['pageSize'] = options.pageSize;
    if (options?.sort) {
      options.sort.forEach((s, index) => {
        params[`sort[${index}][field]`] = s.field;
        if (s.direction) params[`sort[${index}][direction]`] = s.direction;
      });
    }
    if (options?.view) params['view'] = options.view;
    if (options?.offset) params['offset'] = options.offset;
    if (options?.cellFormat) params['cellFormat'] = options.cellFormat;
    if (options?.timeZone) params['timeZone'] = options.timeZone;
    if (options?.userLocale) params['userLocale'] = options.userLocale;
    if (options?.returnFieldsByFieldId) params['returnFieldsByFieldId'] = options.returnFieldsByFieldId;

    let response = await this.api.get(`/${this.baseId}/${encodeURIComponent(tableIdOrName)}`, { params });
    return response.data;
  }

  async getRecord(
    tableIdOrName: string,
    recordId: string,
    options?: { returnFieldsByFieldId?: boolean }
  ): Promise<AirtableRecord> {
    let params: Record<string, any> = {};
    if (options?.returnFieldsByFieldId) params['returnFieldsByFieldId'] = options.returnFieldsByFieldId;

    let response = await this.api.get(
      `/${this.baseId}/${encodeURIComponent(tableIdOrName)}/${recordId}`,
      { params }
    );
    return response.data;
  }

  async createRecords(
    tableIdOrName: string,
    records: { fields: Record<string, any> }[],
    options?: { typecast?: boolean; returnFieldsByFieldId?: boolean }
  ): Promise<{ records: AirtableRecord[] }> {
    let body: Record<string, any> = {
      records,
    };
    if (options?.typecast) body['typecast'] = true;
    if (options?.returnFieldsByFieldId) body['returnFieldsByFieldId'] = true;

    let response = await this.api.post(
      `/${this.baseId}/${encodeURIComponent(tableIdOrName)}`,
      body
    );
    return response.data;
  }

  async updateRecords(
    tableIdOrName: string,
    records: { id: string; fields: Record<string, any> }[],
    options?: { typecast?: boolean; returnFieldsByFieldId?: boolean; method?: 'PATCH' | 'PUT' }
  ): Promise<{ records: AirtableRecord[] }> {
    let body: Record<string, any> = {
      records,
    };
    if (options?.typecast) body['typecast'] = true;
    if (options?.returnFieldsByFieldId) body['returnFieldsByFieldId'] = true;

    let method = options?.method || 'PATCH';
    let response = method === 'PUT'
      ? await this.api.put(`/${this.baseId}/${encodeURIComponent(tableIdOrName)}`, body)
      : await this.api.patch(`/${this.baseId}/${encodeURIComponent(tableIdOrName)}`, body);

    return response.data;
  }

  async upsertRecords(
    tableIdOrName: string,
    records: { fields: Record<string, any> }[],
    fieldsToMergeOn: string[],
    options?: { typecast?: boolean; returnFieldsByFieldId?: boolean }
  ): Promise<{
    records: AirtableRecord[];
    createdRecords: string[];
    updatedRecords: string[];
  }> {
    let body: Record<string, any> = {
      performUpsert: {
        fieldsToMergeOn,
      },
      records,
    };
    if (options?.typecast) body['typecast'] = true;
    if (options?.returnFieldsByFieldId) body['returnFieldsByFieldId'] = true;

    let response = await this.api.patch(
      `/${this.baseId}/${encodeURIComponent(tableIdOrName)}`,
      body
    );
    return response.data;
  }

  async deleteRecords(
    tableIdOrName: string,
    recordIds: string[]
  ): Promise<{ records: { id: string; deleted: boolean }[] }> {
    let params = new URLSearchParams();
    recordIds.forEach(id => params.append('records[]', id));

    let response = await this.api.delete(
      `/${this.baseId}/${encodeURIComponent(tableIdOrName)}`,
      { params }
    );
    return response.data;
  }

  // ─── Schema ──────────────────────────────────────────────────────────

  async getBaseSchema(): Promise<AirtableBaseSchema> {
    let response = await this.api.get(`/meta/bases/${this.baseId}/tables`);
    return response.data;
  }

  async createTable(
    name: string,
    fields: { name: string; type: string; description?: string; options?: Record<string, any> }[],
    description?: string
  ): Promise<any> {
    let body: Record<string, any> = { name, fields };
    if (description) body['description'] = description;

    let response = await this.api.post(`/meta/bases/${this.baseId}/tables`, body);
    return response.data;
  }

  async updateTable(
    tableIdOrName: string,
    updates: { name?: string; description?: string }
  ): Promise<any> {
    let response = await this.api.patch(
      `/meta/bases/${this.baseId}/tables/${encodeURIComponent(tableIdOrName)}`,
      updates
    );
    return response.data;
  }

  async createField(
    tableIdOrName: string,
    field: { name: string; type: string; description?: string; options?: Record<string, any> }
  ): Promise<any> {
    let response = await this.api.post(
      `/meta/bases/${this.baseId}/tables/${encodeURIComponent(tableIdOrName)}/fields`,
      field
    );
    return response.data;
  }

  async updateField(
    tableIdOrName: string,
    fieldIdOrName: string,
    updates: { name?: string; description?: string; options?: Record<string, any> }
  ): Promise<any> {
    let response = await this.api.patch(
      `/meta/bases/${this.baseId}/tables/${encodeURIComponent(tableIdOrName)}/fields/${encodeURIComponent(fieldIdOrName)}`,
      updates
    );
    return response.data;
  }

  // ─── Comments ────────────────────────────────────────────────────────

  async listComments(
    tableIdOrName: string,
    recordId: string,
    options?: { offset?: string; pageSize?: number }
  ): Promise<{ comments: AirtableComment[]; offset?: string }> {
    let params: Record<string, any> = {};
    if (options?.offset) params['offset'] = options.offset;
    if (options?.pageSize) params['pageSize'] = options.pageSize;

    let response = await this.api.get(
      `/${this.baseId}/${encodeURIComponent(tableIdOrName)}/${recordId}/comments`,
      { params }
    );
    return response.data;
  }

  async createComment(
    tableIdOrName: string,
    recordId: string,
    text: string
  ): Promise<AirtableComment> {
    let response = await this.api.post(
      `/${this.baseId}/${encodeURIComponent(tableIdOrName)}/${recordId}/comments`,
      { text }
    );
    return response.data;
  }

  async updateComment(
    tableIdOrName: string,
    recordId: string,
    commentId: string,
    text: string
  ): Promise<AirtableComment> {
    let response = await this.api.patch(
      `/${this.baseId}/${encodeURIComponent(tableIdOrName)}/${recordId}/comments/${commentId}`,
      { text }
    );
    return response.data;
  }

  async deleteComment(
    tableIdOrName: string,
    recordId: string,
    commentId: string
  ): Promise<void> {
    await this.api.delete(
      `/${this.baseId}/${encodeURIComponent(tableIdOrName)}/${recordId}/comments/${commentId}`
    );
  }

  // ─── Webhooks ────────────────────────────────────────────────────────

  async createWebhook(
    notificationUrl: string,
    specification: {
      options: {
        filters?: {
          dataTypes?: string[];
          recordChangeScope?: string;
        };
      };
    }
  ): Promise<CreateWebhookResponse> {
    let response = await this.api.post(`/bases/${this.baseId}/webhooks`, {
      notificationUrl,
      specification,
    });
    return response.data;
  }

  async listWebhooks(): Promise<{ webhooks: AirtableWebhook[] }> {
    let response = await this.api.get(`/bases/${this.baseId}/webhooks`);
    return response.data;
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.api.delete(`/bases/${this.baseId}/webhooks/${webhookId}`);
  }

  async refreshWebhook(webhookId: string): Promise<{ expirationTime: string }> {
    let response = await this.api.post(`/bases/${this.baseId}/webhooks/${webhookId}/refresh`);
    return response.data;
  }

  async getWebhookPayloads(
    webhookId: string,
    cursor?: number
  ): Promise<WebhookPayloadsResponse> {
    let params: Record<string, any> = {};
    if (cursor !== undefined) params['cursor'] = cursor;

    let response = await this.api.get(`/bases/${this.baseId}/webhooks/${webhookId}/payloads`, { params });
    return response.data;
  }

  // ─── Collaborators ──────────────────────────────────────────────────

  async addBaseCollaborator(
    userId: string,
    permissionLevel: string
  ): Promise<any> {
    let response = await this.api.post(`/meta/bases/${this.baseId}/collaborators`, {
      collaborators: [{ user: { id: userId }, permissionLevel }],
    });
    return response.data;
  }

  async updateBaseCollaborator(
    userId: string,
    permissionLevel: string
  ): Promise<any> {
    let response = await this.api.patch(
      `/meta/bases/${this.baseId}/collaborators/${userId}`,
      { permissionLevel }
    );
    return response.data;
  }

  async deleteBaseCollaborator(userId: string): Promise<void> {
    await this.api.delete(`/meta/bases/${this.baseId}/collaborators/${userId}`);
  }

  // ─── Bases ───────────────────────────────────────────────────────────

  async listBases(options?: { offset?: string }): Promise<{
    bases: { id: string; name: string; permissionLevel: string }[];
    offset?: string;
  }> {
    let params: Record<string, any> = {};
    if (options?.offset) params['offset'] = options.offset;

    let response = await this.api.get('/meta/bases', { params });
    return response.data;
  }
}
