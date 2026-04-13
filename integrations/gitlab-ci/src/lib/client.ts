import { createAxios } from 'slates';

export interface ClientConfig {
  token: string;
  host?: string;
}

export class Client {
  private http: ReturnType<typeof createAxios>;

  constructor(private config: ClientConfig) {
    let baseURL = `${(config.host || 'https://gitlab.com').replace(/\/$/, '')}/api/v4`;
    this.http = createAxios({ baseURL });
  }

  private get headers() {
    return { 'PRIVATE-TOKEN': this.config.token };
  }

  // ---- Pipelines ----

  async listPipelines(projectId: string, params?: {
    scope?: string;
    status?: string;
    ref?: string;
    sha?: string;
    source?: string;
    name?: string;
    yamlErrors?: boolean;
    orderBy?: string;
    sort?: string;
    perPage?: number;
    page?: number;
  }) {
    let response = await this.http.get(`/projects/${encodeURIComponent(projectId)}/pipelines`, {
      headers: this.headers,
      params
    });
    return response.data;
  }

  async getPipeline(projectId: string, pipelineId: number) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/pipelines/${pipelineId}`,
      { headers: this.headers }
    );
    return response.data;
  }

  async createPipeline(projectId: string, ref: string, variables?: Array<{ key: string; value: string; variable_type?: string }>) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/pipeline`,
      { ref, variables },
      { headers: this.headers }
    );
    return response.data;
  }

  async retryPipeline(projectId: string, pipelineId: number) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/pipelines/${pipelineId}/retry`,
      {},
      { headers: this.headers }
    );
    return response.data;
  }

  async cancelPipeline(projectId: string, pipelineId: number) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/pipelines/${pipelineId}/cancel`,
      {},
      { headers: this.headers }
    );
    return response.data;
  }

  async deletePipeline(projectId: string, pipelineId: number) {
    await this.http.delete(
      `/projects/${encodeURIComponent(projectId)}/pipelines/${pipelineId}`,
      { headers: this.headers }
    );
  }

  async getPipelineTestReport(projectId: string, pipelineId: number) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/pipelines/${pipelineId}/test_report`,
      { headers: this.headers }
    );
    return response.data;
  }

  async getPipelineTestReportSummary(projectId: string, pipelineId: number) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/pipelines/${pipelineId}/test_report_summary`,
      { headers: this.headers }
    );
    return response.data;
  }

  // ---- Jobs ----

  async listPipelineJobs(projectId: string, pipelineId: number, params?: {
    scope?: string[];
    includeRetried?: boolean;
    perPage?: number;
    page?: number;
  }) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/pipelines/${pipelineId}/jobs`,
      { headers: this.headers, params }
    );
    return response.data;
  }

  async listProjectJobs(projectId: string, params?: {
    scope?: string[];
    perPage?: number;
    page?: number;
  }) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/jobs`,
      { headers: this.headers, params }
    );
    return response.data;
  }

  async getJob(projectId: string, jobId: number) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/jobs/${jobId}`,
      { headers: this.headers }
    );
    return response.data;
  }

  async getJobLog(projectId: string, jobId: number) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/trace`,
      { headers: { ...this.headers, 'Accept': 'text/plain' } }
    );
    return response.data;
  }

  async retryJob(projectId: string, jobId: number) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/retry`,
      {},
      { headers: this.headers }
    );
    return response.data;
  }

  async cancelJob(projectId: string, jobId: number) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/cancel`,
      {},
      { headers: this.headers }
    );
    return response.data;
  }

  async eraseJob(projectId: string, jobId: number) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/erase`,
      {},
      { headers: this.headers }
    );
    return response.data;
  }

  async playJob(projectId: string, jobId: number, variables?: Array<{ key: string; value: string }>) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/play`,
      variables ? { job_variables_attributes: variables } : {},
      { headers: this.headers }
    );
    return response.data;
  }

  // ---- Pipeline Triggers ----

  async listPipelineTriggers(projectId: string) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/triggers`,
      { headers: this.headers }
    );
    return response.data;
  }

  async createPipelineTrigger(projectId: string, description: string) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/triggers`,
      { description },
      { headers: this.headers }
    );
    return response.data;
  }

  async getPipelineTrigger(projectId: string, triggerId: number) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/triggers/${triggerId}`,
      { headers: this.headers }
    );
    return response.data;
  }

  async updatePipelineTrigger(projectId: string, triggerId: number, description: string) {
    let response = await this.http.put(
      `/projects/${encodeURIComponent(projectId)}/triggers/${triggerId}`,
      { description },
      { headers: this.headers }
    );
    return response.data;
  }

  async deletePipelineTrigger(projectId: string, triggerId: number) {
    await this.http.delete(
      `/projects/${encodeURIComponent(projectId)}/triggers/${triggerId}`,
      { headers: this.headers }
    );
  }

  async triggerPipeline(projectId: string, token: string, ref: string, variables?: Record<string, string>) {
    let formData: Record<string, string> = { token, ref };
    if (variables) {
      for (let [key, value] of Object.entries(variables)) {
        formData[`variables[${key}]`] = value;
      }
    }
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/trigger/pipeline`,
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data;
  }

  // ---- Pipeline Schedules ----

  async listPipelineSchedules(projectId: string, params?: { scope?: string }) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/pipeline_schedules`,
      { headers: this.headers, params }
    );
    return response.data;
  }

  async getPipelineSchedule(projectId: string, scheduleId: number) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/pipeline_schedules/${scheduleId}`,
      { headers: this.headers }
    );
    return response.data;
  }

  async createPipelineSchedule(projectId: string, data: {
    description: string;
    ref: string;
    cron: string;
    cron_timezone?: string;
    active?: boolean;
  }) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/pipeline_schedules`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }

  async updatePipelineSchedule(projectId: string, scheduleId: number, data: {
    description?: string;
    ref?: string;
    cron?: string;
    cron_timezone?: string;
    active?: boolean;
  }) {
    let response = await this.http.put(
      `/projects/${encodeURIComponent(projectId)}/pipeline_schedules/${scheduleId}`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }

  async deletePipelineSchedule(projectId: string, scheduleId: number) {
    await this.http.delete(
      `/projects/${encodeURIComponent(projectId)}/pipeline_schedules/${scheduleId}`,
      { headers: this.headers }
    );
  }

  async createPipelineScheduleVariable(projectId: string, scheduleId: number, key: string, value: string, variableType?: string) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/pipeline_schedules/${scheduleId}/variables`,
      { key, value, variable_type: variableType || 'env_var' },
      { headers: this.headers }
    );
    return response.data;
  }

  async updatePipelineScheduleVariable(projectId: string, scheduleId: number, key: string, value: string, variableType?: string) {
    let response = await this.http.put(
      `/projects/${encodeURIComponent(projectId)}/pipeline_schedules/${scheduleId}/variables/${key}`,
      { value, variable_type: variableType || 'env_var' },
      { headers: this.headers }
    );
    return response.data;
  }

  async deletePipelineScheduleVariable(projectId: string, scheduleId: number, key: string) {
    await this.http.delete(
      `/projects/${encodeURIComponent(projectId)}/pipeline_schedules/${scheduleId}/variables/${key}`,
      { headers: this.headers }
    );
  }

  // ---- CI/CD Variables ----

  async listProjectVariables(projectId: string) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/variables`,
      { headers: this.headers }
    );
    return response.data;
  }

  async getProjectVariable(projectId: string, key: string) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/variables/${key}`,
      { headers: this.headers }
    );
    return response.data;
  }

  async createProjectVariable(projectId: string, data: {
    key: string;
    value: string;
    variable_type?: string;
    protected?: boolean;
    masked?: boolean;
    environment_scope?: string;
  }) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/variables`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }

  async updateProjectVariable(projectId: string, key: string, data: {
    value?: string;
    variable_type?: string;
    protected?: boolean;
    masked?: boolean;
    environment_scope?: string;
  }) {
    let response = await this.http.put(
      `/projects/${encodeURIComponent(projectId)}/variables/${key}`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }

  async deleteProjectVariable(projectId: string, key: string) {
    await this.http.delete(
      `/projects/${encodeURIComponent(projectId)}/variables/${key}`,
      { headers: this.headers }
    );
  }

  async listGroupVariables(groupId: string) {
    let response = await this.http.get(
      `/groups/${encodeURIComponent(groupId)}/variables`,
      { headers: this.headers }
    );
    return response.data;
  }

  async createGroupVariable(groupId: string, data: {
    key: string;
    value: string;
    variable_type?: string;
    protected?: boolean;
    masked?: boolean;
    environment_scope?: string;
  }) {
    let response = await this.http.post(
      `/groups/${encodeURIComponent(groupId)}/variables`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }

  async updateGroupVariable(groupId: string, key: string, data: {
    value?: string;
    variable_type?: string;
    protected?: boolean;
    masked?: boolean;
    environment_scope?: string;
  }) {
    let response = await this.http.put(
      `/groups/${encodeURIComponent(groupId)}/variables/${key}`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }

  async deleteGroupVariable(groupId: string, key: string) {
    await this.http.delete(
      `/groups/${encodeURIComponent(groupId)}/variables/${key}`,
      { headers: this.headers }
    );
  }

  // ---- Environments ----

  async listEnvironments(projectId: string, params?: {
    name?: string;
    search?: string;
    states?: string;
    perPage?: number;
    page?: number;
  }) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/environments`,
      { headers: this.headers, params }
    );
    return response.data;
  }

  async getEnvironment(projectId: string, environmentId: number) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/environments/${environmentId}`,
      { headers: this.headers }
    );
    return response.data;
  }

  async createEnvironment(projectId: string, data: {
    name: string;
    external_url?: string;
    tier?: string;
  }) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/environments`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }

  async updateEnvironment(projectId: string, environmentId: number, data: {
    name?: string;
    external_url?: string;
    tier?: string;
  }) {
    let response = await this.http.put(
      `/projects/${encodeURIComponent(projectId)}/environments/${environmentId}`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }

  async stopEnvironment(projectId: string, environmentId: number) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/environments/${environmentId}/stop`,
      {},
      { headers: this.headers }
    );
    return response.data;
  }

  async deleteEnvironment(projectId: string, environmentId: number) {
    await this.http.delete(
      `/projects/${encodeURIComponent(projectId)}/environments/${environmentId}`,
      { headers: this.headers }
    );
  }

  // ---- Deployments ----

  async listDeployments(projectId: string, params?: {
    order_by?: string;
    sort?: string;
    environment?: string;
    status?: string;
    perPage?: number;
    page?: number;
  }) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/deployments`,
      { headers: this.headers, params }
    );
    return response.data;
  }

  async getDeployment(projectId: string, deploymentId: number) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/deployments/${deploymentId}`,
      { headers: this.headers }
    );
    return response.data;
  }

  // ---- Runners ----

  async listProjectRunners(projectId: string, params?: {
    type?: string;
    status?: string;
    paused?: boolean;
    tag_list?: string;
  }) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/runners`,
      { headers: this.headers, params }
    );
    return response.data;
  }

  async listAllRunners(params?: {
    type?: string;
    status?: string;
    paused?: boolean;
    tag_list?: string;
    perPage?: number;
    page?: number;
  }) {
    let response = await this.http.get('/runners/all', {
      headers: this.headers,
      params
    });
    return response.data;
  }

  async getRunner(runnerId: number) {
    let response = await this.http.get(`/runners/${runnerId}`, {
      headers: this.headers
    });
    return response.data;
  }

  async updateRunner(runnerId: number, data: {
    description?: string;
    active?: boolean;
    paused?: boolean;
    tag_list?: string[];
    run_untagged?: boolean;
    locked?: boolean;
    access_level?: string;
    maximum_timeout?: number;
  }) {
    let response = await this.http.put(`/runners/${runnerId}`, data, {
      headers: this.headers
    });
    return response.data;
  }

  async deleteRunner(runnerId: number) {
    await this.http.delete(`/runners/${runnerId}`, {
      headers: this.headers
    });
  }

  async listRunnerJobs(runnerId: number, params?: {
    status?: string;
    order_by?: string;
    sort?: string;
  }) {
    let response = await this.http.get(`/runners/${runnerId}/jobs`, {
      headers: this.headers,
      params
    });
    return response.data;
  }

  // ---- Artifacts ----

  async downloadJobArtifacts(projectId: string, jobId: number) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/artifacts`,
      { headers: this.headers, responseType: 'arraybuffer' }
    );
    return response.data;
  }

  async downloadArtifactFile(projectId: string, jobId: number, artifactPath: string) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/artifacts/${artifactPath}`,
      { headers: this.headers }
    );
    return response.data;
  }

  async downloadBranchArtifacts(projectId: string, refName: string, jobName: string) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/jobs/artifacts/${encodeURIComponent(refName)}/download`,
      { headers: this.headers, params: { job: jobName }, responseType: 'arraybuffer' }
    );
    return response.data;
  }

  async deleteJobArtifacts(projectId: string, jobId: number) {
    await this.http.delete(
      `/projects/${encodeURIComponent(projectId)}/jobs/${jobId}/artifacts`,
      { headers: this.headers }
    );
  }

  // ---- CI Lint ----

  async lintCiConfig(projectId: string, content: string, params?: {
    dry_run?: boolean;
    include_merged_yaml?: boolean;
    ref?: string;
  }) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/ci/lint`,
      { content, ...params },
      { headers: this.headers }
    );
    return response.data;
  }

  // ---- Webhooks ----

  async listProjectWebhooks(projectId: string) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}/hooks`,
      { headers: this.headers }
    );
    return response.data;
  }

  async createProjectWebhook(projectId: string, data: {
    url: string;
    token?: string;
    push_events?: boolean;
    tag_push_events?: boolean;
    merge_requests_events?: boolean;
    pipeline_events?: boolean;
    job_events?: boolean;
    deployment_events?: boolean;
    releases_events?: boolean;
    feature_flag_events?: boolean;
    enable_ssl_verification?: boolean;
  }) {
    let response = await this.http.post(
      `/projects/${encodeURIComponent(projectId)}/hooks`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }

  async updateProjectWebhook(projectId: string, hookId: number, data: {
    url?: string;
    token?: string;
    push_events?: boolean;
    tag_push_events?: boolean;
    merge_requests_events?: boolean;
    pipeline_events?: boolean;
    job_events?: boolean;
    deployment_events?: boolean;
    releases_events?: boolean;
    feature_flag_events?: boolean;
    enable_ssl_verification?: boolean;
  }) {
    let response = await this.http.put(
      `/projects/${encodeURIComponent(projectId)}/hooks/${hookId}`,
      data,
      { headers: this.headers }
    );
    return response.data;
  }

  async deleteProjectWebhook(projectId: string, hookId: number) {
    await this.http.delete(
      `/projects/${encodeURIComponent(projectId)}/hooks/${hookId}`,
      { headers: this.headers }
    );
  }

  // ---- Projects (helper) ----

  async getProject(projectId: string) {
    let response = await this.http.get(
      `/projects/${encodeURIComponent(projectId)}`,
      { headers: this.headers }
    );
    return response.data;
  }
}
