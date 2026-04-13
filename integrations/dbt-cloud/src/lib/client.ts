import { createAxios } from 'slates';

export interface ClientConfig {
  token: string;
  accountId: string;
  baseUrl: string;
}

export class Client {
  private axios;
  private accountId: string;

  constructor(config: ClientConfig) {
    this.accountId = config.accountId;
    this.axios = createAxios({
      baseURL: config.baseUrl.replace(/\/$/, ''),
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // ─── Accounts ──────────────────────────────────────────────

  async getAccount(): Promise<any> {
    let response = await this.axios.get(`/api/v2/accounts/${this.accountId}/`);
    return response.data.data;
  }

  // ─── Projects ──────────────────────────────────────────────

  async listProjects(params?: { limit?: number; offset?: number }): Promise<any[]> {
    let response = await this.axios.get(`/api/v3/accounts/${this.accountId}/projects/`, {
      params
    });
    return response.data.data;
  }

  async getProject(projectId: string): Promise<any> {
    let response = await this.axios.get(
      `/api/v3/accounts/${this.accountId}/projects/${projectId}/`
    );
    return response.data.data;
  }

  // ─── Environments ──────────────────────────────────────────

  async listEnvironments(
    projectId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<any[]> {
    let response = await this.axios.get(
      `/api/v3/accounts/${this.accountId}/projects/${projectId}/environments/`,
      { params }
    );
    return response.data.data;
  }

  async getEnvironment(projectId: string, environmentId: string): Promise<any> {
    let response = await this.axios.get(
      `/api/v3/accounts/${this.accountId}/projects/${projectId}/environments/${environmentId}/`
    );
    return response.data.data;
  }

  // ─── Jobs ──────────────────────────────────────────────────

  async listJobs(params?: {
    project_id?: string;
    environment_id?: string;
    limit?: number;
    offset?: number;
    order_by?: string;
  }): Promise<any[]> {
    let response = await this.axios.get(`/api/v2/accounts/${this.accountId}/jobs/`, {
      params
    });
    return response.data.data;
  }

  async getJob(jobId: string): Promise<any> {
    let response = await this.axios.get(`/api/v2/accounts/${this.accountId}/jobs/${jobId}/`);
    return response.data.data;
  }

  async createJob(jobData: Record<string, any>): Promise<any> {
    let response = await this.axios.post(`/api/v2/accounts/${this.accountId}/jobs/`, jobData);
    return response.data.data;
  }

  async updateJob(jobId: string, jobData: Record<string, any>): Promise<any> {
    let response = await this.axios.post(
      `/api/v2/accounts/${this.accountId}/jobs/${jobId}/`,
      jobData
    );
    return response.data.data;
  }

  async deleteJob(jobId: string): Promise<void> {
    await this.axios.delete(`/api/v2/accounts/${this.accountId}/jobs/${jobId}/`);
  }

  async triggerJobRun(
    jobId: string,
    options?: {
      cause?: string;
      gitSha?: string;
      gitBranch?: string;
      schemaOverride?: string;
      dbtVersionOverride?: string;
      threadsOverride?: number;
      targetNameOverride?: string;
      generateDocsOverride?: boolean;
      timeoutSecondsOverride?: number;
      stepsOverride?: string[];
    }
  ): Promise<any> {
    let body: Record<string, any> = {};
    if (options?.cause) body.cause = options.cause;
    if (options?.gitSha) body.git_sha = options.gitSha;
    if (options?.gitBranch) body.git_branch = options.gitBranch;
    if (options?.schemaOverride) body.schema_override = options.schemaOverride;
    if (options?.dbtVersionOverride) body.dbt_version_override = options.dbtVersionOverride;
    if (options?.threadsOverride !== undefined)
      body.threads_override = options.threadsOverride;
    if (options?.targetNameOverride) body.target_name_override = options.targetNameOverride;
    if (options?.generateDocsOverride !== undefined)
      body.generate_docs_override = options.generateDocsOverride;
    if (options?.timeoutSecondsOverride !== undefined)
      body.timeout_seconds_override = options.timeoutSecondsOverride;
    if (options?.stepsOverride) body.steps_override = options.stepsOverride;

    let response = await this.axios.post(
      `/api/v2/accounts/${this.accountId}/jobs/${jobId}/run/`,
      body
    );
    return response.data.data;
  }

  // ─── Runs ──────────────────────────────────────────────────

  async listRuns(params?: {
    job_definition_id?: string;
    project_id?: string;
    environment_id?: string;
    status?: number;
    order_by?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    let response = await this.axios.get(`/api/v2/accounts/${this.accountId}/runs/`, {
      params
    });
    return response.data.data;
  }

  async getRun(runId: string, params?: { include_related?: string[] }): Promise<any> {
    let queryParams: Record<string, any> = {};
    if (params?.include_related) {
      queryParams.include_related = params.include_related.join(',');
    }
    let response = await this.axios.get(`/api/v2/accounts/${this.accountId}/runs/${runId}/`, {
      params: queryParams
    });
    return response.data.data;
  }

  async cancelRun(runId: string): Promise<any> {
    let response = await this.axios.post(
      `/api/v2/accounts/${this.accountId}/runs/${runId}/cancel/`
    );
    return response.data.data;
  }

  // ─── Artifacts ─────────────────────────────────────────────

  async getRunArtifact(runId: string, path: string, step?: number): Promise<any> {
    let params: Record<string, any> = {};
    if (step !== undefined) params.step = step;
    let response = await this.axios.get(
      `/api/v2/accounts/${this.accountId}/runs/${runId}/artifacts/${path}`,
      { params }
    );
    return response.data;
  }

  async listRunArtifacts(runId: string, step?: number): Promise<string[]> {
    let params: Record<string, any> = {};
    if (step !== undefined) params.step = step;
    let response = await this.axios.get(
      `/api/v2/accounts/${this.accountId}/runs/${runId}/artifacts/`,
      { params }
    );
    return response.data.data;
  }

  // ─── Users ─────────────────────────────────────────────────

  async listUsers(params?: { limit?: number; offset?: number }): Promise<any[]> {
    let response = await this.axios.get(`/api/v2/accounts/${this.accountId}/users/`, {
      params
    });
    return response.data.data;
  }

  // ─── Webhooks ──────────────────────────────────────────────

  async listWebhooks(): Promise<any[]> {
    let response = await this.axios.get(
      `/api/v3/accounts/${this.accountId}/webhooks/subscriptions`
    );
    return response.data.data;
  }

  async getWebhook(webhookId: string): Promise<any> {
    let response = await this.axios.get(
      `/api/v3/accounts/${this.accountId}/webhooks/subscription/${webhookId}`
    );
    return response.data.data;
  }

  async createWebhook(data: {
    name: string;
    clientUrl: string;
    eventTypes: string[];
    description?: string;
    active?: boolean;
    jobIds?: number[];
  }): Promise<any> {
    let body: Record<string, any> = {
      name: data.name,
      client_url: data.clientUrl,
      event_types: data.eventTypes
    };
    if (data.description) body.description = data.description;
    if (data.active !== undefined) body.active = data.active;
    if (data.jobIds) body.job_ids = data.jobIds;

    let response = await this.axios.post(
      `/api/v3/accounts/${this.accountId}/webhooks/subscriptions`,
      body
    );
    return response.data.data;
  }

  async updateWebhook(
    webhookId: string,
    data: {
      name?: string;
      clientUrl?: string;
      eventTypes?: string[];
      description?: string;
      active?: boolean;
      jobIds?: number[];
    }
  ): Promise<any> {
    let body: Record<string, any> = {};
    if (data.name) body.name = data.name;
    if (data.clientUrl) body.client_url = data.clientUrl;
    if (data.eventTypes) body.event_types = data.eventTypes;
    if (data.description) body.description = data.description;
    if (data.active !== undefined) body.active = data.active;
    if (data.jobIds) body.job_ids = data.jobIds;

    let response = await this.axios.put(
      `/api/v3/accounts/${this.accountId}/webhooks/subscription/${webhookId}`,
      body
    );
    return response.data.data;
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.axios.delete(
      `/api/v3/accounts/${this.accountId}/webhooks/subscription/${webhookId}`
    );
  }

  async testWebhook(webhookId: string): Promise<any> {
    let response = await this.axios.get(
      `/api/v3/accounts/${this.accountId}/webhooks/subscription/${webhookId}/test`
    );
    return response.data.data;
  }
}
