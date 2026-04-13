import { createAxios } from 'slates';
import type { AxiosInstance } from 'axios';

export interface JotFormClientConfig {
  token: string;
  apiDomain: string;
}

export interface ListParams {
  offset?: number;
  limit?: number;
  filter?: Record<string, any>;
  orderby?: string;
  direction?: 'ASC' | 'DESC';
}

export class Client {
  private http: AxiosInstance;

  constructor(private config: JotFormClientConfig) {
    this.http = createAxios({
      baseURL: config.apiDomain,
      headers: {
        APIKEY: config.token
      }
    });
  }

  // ── User ──────────────────────────────────────────────

  async getUser(): Promise<any> {
    let response = await this.http.get('/user');
    return response.data.content;
  }

  async getUserUsage(): Promise<any> {
    let response = await this.http.get('/user/usage');
    return response.data.content;
  }

  async getUserSubusers(): Promise<any[]> {
    let response = await this.http.get('/user/subusers');
    return response.data.content;
  }

  // ── Forms ─────────────────────────────────────────────

  async listForms(params?: ListParams): Promise<any[]> {
    let response = await this.http.get('/user/forms', {
      params: this.buildListParams(params)
    });
    return response.data.content;
  }

  async getForm(formId: string): Promise<any> {
    let response = await this.http.get(`/form/${formId}`);
    return response.data.content;
  }

  async createForm(formData: {
    questions?: Record<string, any>;
    properties?: Record<string, any>;
    emails?: Record<string, any>;
  }): Promise<any> {
    let payload: Record<string, any> = {};

    if (formData.questions) {
      for (let [key, value] of Object.entries(formData.questions)) {
        for (let [prop, propValue] of Object.entries(value as Record<string, any>)) {
          payload[`questions[${key}][${prop}]`] = propValue;
        }
      }
    }
    if (formData.properties) {
      for (let [key, value] of Object.entries(formData.properties)) {
        payload[`properties[${key}]`] = value;
      }
    }
    if (formData.emails) {
      for (let [key, value] of Object.entries(formData.emails)) {
        for (let [prop, propValue] of Object.entries(value as Record<string, any>)) {
          payload[`emails[${key}][${prop}]`] = propValue;
        }
      }
    }

    let response = await this.http.post('/form', payload);
    return response.data.content;
  }

  async deleteForm(formId: string): Promise<any> {
    let response = await this.http.delete(`/form/${formId}`);
    return response.data.content;
  }

  async cloneForm(formId: string): Promise<any> {
    let response = await this.http.post(`/form/${formId}/clone`);
    return response.data.content;
  }

  // ── Form Properties ───────────────────────────────────

  async getFormProperties(formId: string): Promise<any> {
    let response = await this.http.get(`/form/${formId}/properties`);
    return response.data.content;
  }

  async updateFormProperties(formId: string, properties: Record<string, any>): Promise<any> {
    let payload: Record<string, any> = {};
    for (let [key, value] of Object.entries(properties)) {
      payload[`properties[${key}]`] =
        typeof value === 'object' ? JSON.stringify(value) : value;
    }
    let response = await this.http.post(`/form/${formId}/properties`, payload);
    return response.data.content;
  }

  // ── Form Questions ────────────────────────────────────

  async getFormQuestions(formId: string): Promise<any> {
    let response = await this.http.get(`/form/${formId}/questions`);
    return response.data.content;
  }

  async getFormQuestion(formId: string, questionId: string): Promise<any> {
    let response = await this.http.get(`/form/${formId}/question/${questionId}`);
    return response.data.content;
  }

  async addFormQuestion(formId: string, question: Record<string, any>): Promise<any> {
    let payload: Record<string, any> = {};
    for (let [key, value] of Object.entries(question)) {
      payload[`question[${key}]`] = value;
    }
    let response = await this.http.post(`/form/${formId}/questions`, payload);
    return response.data.content;
  }

  async deleteFormQuestion(formId: string, questionId: string): Promise<any> {
    let response = await this.http.delete(`/form/${formId}/question/${questionId}`);
    return response.data.content;
  }

  // ── Submissions ───────────────────────────────────────

  async listAllSubmissions(params?: ListParams): Promise<any[]> {
    let response = await this.http.get('/user/submissions', {
      params: this.buildListParams(params)
    });
    return response.data.content;
  }

  async listFormSubmissions(formId: string, params?: ListParams): Promise<any[]> {
    let response = await this.http.get(`/form/${formId}/submissions`, {
      params: this.buildListParams(params)
    });
    return response.data.content;
  }

  async getSubmission(submissionId: string): Promise<any> {
    let response = await this.http.get(`/submission/${submissionId}`);
    return response.data.content;
  }

  async createSubmission(formId: string, answers: Record<string, any>): Promise<any> {
    let payload: Record<string, any> = {};
    for (let [questionId, value] of Object.entries(answers)) {
      if (typeof value === 'object' && value !== null) {
        for (let [subKey, subValue] of Object.entries(value as Record<string, any>)) {
          payload[`submission[${questionId}][${subKey}]`] = subValue;
        }
      } else {
        payload[`submission[${questionId}]`] = value;
      }
    }
    let response = await this.http.post(`/form/${formId}/submissions`, payload);
    return response.data.content;
  }

  async updateSubmission(submissionId: string, answers: Record<string, any>): Promise<any> {
    let payload: Record<string, any> = {};
    for (let [questionId, value] of Object.entries(answers)) {
      if (typeof value === 'object' && value !== null) {
        for (let [subKey, subValue] of Object.entries(value as Record<string, any>)) {
          payload[`submission[${questionId}][${subKey}]`] = subValue;
        }
      } else {
        payload[`submission[${questionId}]`] = value;
      }
    }
    let response = await this.http.post(`/submission/${submissionId}`, payload);
    return response.data.content;
  }

  async deleteSubmission(submissionId: string): Promise<any> {
    let response = await this.http.delete(`/submission/${submissionId}`);
    return response.data.content;
  }

  // ── Folders ───────────────────────────────────────────

  async listFolders(): Promise<any> {
    let response = await this.http.get('/user/folders');
    return response.data.content;
  }

  async getFolder(folderId: string): Promise<any> {
    let response = await this.http.get(`/folder/${folderId}`);
    return response.data.content;
  }

  async createFolder(name: string, parent?: string): Promise<any> {
    let payload: Record<string, any> = { name };
    if (parent) {
      payload.parent = parent;
    }
    let response = await this.http.post('/folder', payload);
    return response.data.content;
  }

  async deleteFolder(folderId: string): Promise<any> {
    let response = await this.http.delete(`/folder/${folderId}`);
    return response.data.content;
  }

  // ── Reports ───────────────────────────────────────────

  async listReports(): Promise<any[]> {
    let response = await this.http.get('/user/reports');
    return response.data.content;
  }

  async listFormReports(formId: string): Promise<any[]> {
    let response = await this.http.get(`/form/${formId}/reports`);
    return response.data.content;
  }

  async getReport(reportId: string): Promise<any> {
    let response = await this.http.get(`/report/${reportId}`);
    return response.data.content;
  }

  async createFormReport(
    formId: string,
    report: { title: string; listType: string; fields?: string }
  ): Promise<any> {
    let response = await this.http.post(`/form/${formId}/reports`, {
      title: report.title,
      list_type: report.listType,
      ...(report.fields ? { fields: report.fields } : {})
    });
    return response.data.content;
  }

  async deleteReport(reportId: string): Promise<any> {
    let response = await this.http.delete(`/report/${reportId}`);
    return response.data.content;
  }

  // ── Webhooks ──────────────────────────────────────────

  async listFormWebhooks(formId: string): Promise<any> {
    let response = await this.http.get(`/form/${formId}/webhooks`);
    return response.data.content;
  }

  async createFormWebhook(formId: string, webhookUrl: string): Promise<any> {
    let response = await this.http.post(`/form/${formId}/webhooks`, {
      webhookURL: webhookUrl
    });
    return response.data.content;
  }

  async deleteFormWebhook(formId: string, webhookId: string): Promise<any> {
    let response = await this.http.delete(`/form/${formId}/webhooks/${webhookId}`);
    return response.data.content;
  }

  // ── Helpers ───────────────────────────────────────────

  private buildListParams(params?: ListParams): Record<string, string | number> {
    let result: Record<string, string | number> = {};
    if (params?.offset !== undefined) result.offset = params.offset;
    if (params?.limit !== undefined) result.limit = params.limit;
    if (params?.orderby) result.orderby = params.orderby;
    if (params?.direction) result.direction = params.direction;
    if (params?.filter) {
      result.filter = JSON.stringify(params.filter);
    }
    return result;
  }
}
