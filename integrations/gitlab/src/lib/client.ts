import { createAxios } from 'slates';

export interface GitLabClientConfig {
  token: string;
  instanceUrl?: string;
}

export class GitLabClient {
  private api;
  private baseUrl: string;

  constructor(private config: GitLabClientConfig) {
    this.baseUrl = (config.instanceUrl?.replace(/\/+$/, '') || 'https://gitlab.com');
    this.api = createAxios({
      baseURL: `${this.baseUrl}/api/v4`
    });
  }

  private headers() {
    return {
      'Authorization': `Bearer ${this.config.token}`,
      'Content-Type': 'application/json'
    };
  }

  // ── Projects ──────────────────────────────────────────────

  async listProjects(params: {
    search?: string;
    owned?: boolean;
    membership?: boolean;
    visibility?: string;
    orderBy?: string;
    sort?: string;
    perPage?: number;
    page?: number;
    withIssuesEnabled?: boolean;
    withMergeRequestsEnabled?: boolean;
    archived?: boolean;
  } = {}): Promise<{ projects: any[]; totalPages: number }> {
    let queryParams: Record<string, any> = {};
    if (params.search) queryParams.search = params.search;
    if (params.owned !== undefined) queryParams.owned = params.owned;
    if (params.membership !== undefined) queryParams.membership = params.membership;
    if (params.visibility) queryParams.visibility = params.visibility;
    if (params.orderBy) queryParams.order_by = params.orderBy;
    if (params.sort) queryParams.sort = params.sort;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;
    if (params.withIssuesEnabled !== undefined) queryParams.with_issues_enabled = params.withIssuesEnabled;
    if (params.withMergeRequestsEnabled !== undefined) queryParams.with_merge_requests_enabled = params.withMergeRequestsEnabled;
    if (params.archived !== undefined) queryParams.archived = params.archived;

    let response = await this.api.get('/projects', {
      params: queryParams,
      headers: this.headers()
    });

    let totalPages = parseInt(response.headers?.['x-total-pages'] || '1', 10);
    return { projects: response.data, totalPages };
  }

  async getProject(projectId: string | number): Promise<any> {
    let response = await this.api.get(`/projects/${encodeURIComponent(String(projectId))}`, {
      headers: this.headers()
    });
    return response.data;
  }

  async createProject(params: {
    name: string;
    path?: string;
    description?: string;
    visibility?: string;
    initializeWithReadme?: boolean;
    namespaceId?: number;
    defaultBranch?: string;
  }): Promise<any> {
    let body: Record<string, any> = {
      name: params.name
    };
    if (params.path) body.path = params.path;
    if (params.description) body.description = params.description;
    if (params.visibility) body.visibility = params.visibility;
    if (params.initializeWithReadme !== undefined) body.initialize_with_readme = params.initializeWithReadme;
    if (params.namespaceId) body.namespace_id = params.namespaceId;
    if (params.defaultBranch) body.default_branch = params.defaultBranch;

    let response = await this.api.post('/projects', body, {
      headers: this.headers()
    });
    return response.data;
  }

  async updateProject(projectId: string | number, params: {
    name?: string;
    description?: string;
    visibility?: string;
    defaultBranch?: string;
    archived?: boolean;
  }): Promise<any> {
    let body: Record<string, any> = {};
    if (params.name) body.name = params.name;
    if (params.description !== undefined) body.description = params.description;
    if (params.visibility) body.visibility = params.visibility;
    if (params.defaultBranch) body.default_branch = params.defaultBranch;
    if (params.archived !== undefined) body.archived = params.archived;

    let response = await this.api.put(`/projects/${encodeURIComponent(String(projectId))}`, body, {
      headers: this.headers()
    });
    return response.data;
  }

  async deleteProject(projectId: string | number): Promise<void> {
    await this.api.delete(`/projects/${encodeURIComponent(String(projectId))}`, {
      headers: this.headers()
    });
  }

  async forkProject(projectId: string | number, params?: {
    namespace?: string;
    namespaceId?: number;
    name?: string;
    path?: string;
  }): Promise<any> {
    let body: Record<string, any> = {};
    if (params?.namespace) body.namespace = params.namespace;
    if (params?.namespaceId) body.namespace_id = params.namespaceId;
    if (params?.name) body.name = params.name;
    if (params?.path) body.path = params.path;

    let response = await this.api.post(`/projects/${encodeURIComponent(String(projectId))}/fork`, body, {
      headers: this.headers()
    });
    return response.data;
  }

  // ── Repository ────────────────────────────────────────────

  async getRepositoryTree(projectId: string | number, params: {
    path?: string;
    ref?: string;
    recursive?: boolean;
    perPage?: number;
    page?: number;
  } = {}): Promise<any[]> {
    let queryParams: Record<string, any> = {};
    if (params.path) queryParams.path = params.path;
    if (params.ref) queryParams.ref = params.ref;
    if (params.recursive !== undefined) queryParams.recursive = params.recursive;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;

    let response = await this.api.get(`/projects/${encodeURIComponent(String(projectId))}/repository/tree`, {
      params: queryParams,
      headers: this.headers()
    });
    return response.data;
  }

  async getFileContent(projectId: string | number, filePath: string, ref?: string): Promise<any> {
    let queryParams: Record<string, any> = {};
    if (ref) queryParams.ref = ref;

    let response = await this.api.get(`/projects/${encodeURIComponent(String(projectId))}/repository/files/${encodeURIComponent(filePath)}`, {
      params: queryParams,
      headers: this.headers()
    });
    return response.data;
  }

  async createOrUpdateFile(projectId: string | number, filePath: string, params: {
    branch: string;
    content: string;
    commitMessage: string;
    encoding?: string;
    startBranch?: string;
  }): Promise<any> {
    let body: Record<string, any> = {
      branch: params.branch,
      content: params.content,
      commit_message: params.commitMessage
    };
    if (params.encoding) body.encoding = params.encoding;
    if (params.startBranch) body.start_branch = params.startBranch;

    try {
      let response = await this.api.put(
        `/projects/${encodeURIComponent(String(projectId))}/repository/files/${encodeURIComponent(filePath)}`,
        body,
        { headers: this.headers() }
      );
      return response.data;
    } catch (e: any) {
      if (e?.response?.status === 400 || e?.response?.status === 404) {
        let response = await this.api.post(
          `/projects/${encodeURIComponent(String(projectId))}/repository/files/${encodeURIComponent(filePath)}`,
          body,
          { headers: this.headers() }
        );
        return response.data;
      }
      throw e;
    }
  }

  async deleteFile(projectId: string | number, filePath: string, params: {
    branch: string;
    commitMessage: string;
  }): Promise<void> {
    await this.api.delete(
      `/projects/${encodeURIComponent(String(projectId))}/repository/files/${encodeURIComponent(filePath)}`,
      {
        headers: this.headers(),
        data: {
          branch: params.branch,
          commit_message: params.commitMessage
        }
      }
    );
  }

  async compareBranches(projectId: string | number, from: string, to: string): Promise<any> {
    let response = await this.api.get(`/projects/${encodeURIComponent(String(projectId))}/repository/compare`, {
      params: { from, to },
      headers: this.headers()
    });
    return response.data;
  }

  // ── Branches ──────────────────────────────────────────────

  async listBranches(projectId: string | number, params: {
    search?: string;
    perPage?: number;
    page?: number;
  } = {}): Promise<any[]> {
    let queryParams: Record<string, any> = {};
    if (params.search) queryParams.search = params.search;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;

    let response = await this.api.get(`/projects/${encodeURIComponent(String(projectId))}/repository/branches`, {
      params: queryParams,
      headers: this.headers()
    });
    return response.data;
  }

  async createBranch(projectId: string | number, branchName: string, ref: string): Promise<any> {
    let response = await this.api.post(`/projects/${encodeURIComponent(String(projectId))}/repository/branches`, {
      branch: branchName,
      ref
    }, {
      headers: this.headers()
    });
    return response.data;
  }

  async deleteBranch(projectId: string | number, branchName: string): Promise<void> {
    await this.api.delete(`/projects/${encodeURIComponent(String(projectId))}/repository/branches/${encodeURIComponent(branchName)}`, {
      headers: this.headers()
    });
  }

  // ── Issues ────────────────────────────────────────────────

  async listIssues(params: {
    projectId?: string | number;
    state?: string;
    labels?: string;
    milestone?: string;
    assigneeId?: number;
    authorId?: number;
    search?: string;
    orderBy?: string;
    sort?: string;
    perPage?: number;
    page?: number;
    scope?: string;
    createdAfter?: string;
    updatedAfter?: string;
  } = {}): Promise<{ issues: any[]; totalPages: number }> {
    let queryParams: Record<string, any> = {};
    if (params.state) queryParams.state = params.state;
    if (params.labels) queryParams.labels = params.labels;
    if (params.milestone) queryParams.milestone = params.milestone;
    if (params.assigneeId) queryParams.assignee_id = params.assigneeId;
    if (params.authorId) queryParams.author_id = params.authorId;
    if (params.search) queryParams.search = params.search;
    if (params.orderBy) queryParams.order_by = params.orderBy;
    if (params.sort) queryParams.sort = params.sort;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;
    if (params.scope) queryParams.scope = params.scope;
    if (params.createdAfter) queryParams.created_after = params.createdAfter;
    if (params.updatedAfter) queryParams.updated_after = params.updatedAfter;

    let url = params.projectId
      ? `/projects/${encodeURIComponent(String(params.projectId))}/issues`
      : '/issues';

    let response = await this.api.get(url, {
      params: queryParams,
      headers: this.headers()
    });

    let totalPages = parseInt(response.headers?.['x-total-pages'] || '1', 10);
    return { issues: response.data, totalPages };
  }

  async getIssue(projectId: string | number, issueIid: number): Promise<any> {
    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/issues/${issueIid}`,
      { headers: this.headers() }
    );
    return response.data;
  }

  async createIssue(projectId: string | number, params: {
    title: string;
    description?: string;
    assigneeIds?: number[];
    milestoneId?: number;
    labels?: string;
    dueDate?: string;
    confidential?: boolean;
    weight?: number;
  }): Promise<any> {
    let body: Record<string, any> = { title: params.title };
    if (params.description) body.description = params.description;
    if (params.assigneeIds) body.assignee_ids = params.assigneeIds;
    if (params.milestoneId) body.milestone_id = params.milestoneId;
    if (params.labels) body.labels = params.labels;
    if (params.dueDate) body.due_date = params.dueDate;
    if (params.confidential !== undefined) body.confidential = params.confidential;
    if (params.weight !== undefined) body.weight = params.weight;

    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/issues`,
      body,
      { headers: this.headers() }
    );
    return response.data;
  }

  async updateIssue(projectId: string | number, issueIid: number, params: {
    title?: string;
    description?: string;
    assigneeIds?: number[];
    milestoneId?: number;
    labels?: string;
    stateEvent?: string;
    dueDate?: string;
    confidential?: boolean;
    weight?: number;
  }): Promise<any> {
    let body: Record<string, any> = {};
    if (params.title) body.title = params.title;
    if (params.description !== undefined) body.description = params.description;
    if (params.assigneeIds) body.assignee_ids = params.assigneeIds;
    if (params.milestoneId) body.milestone_id = params.milestoneId;
    if (params.labels !== undefined) body.labels = params.labels;
    if (params.stateEvent) body.state_event = params.stateEvent;
    if (params.dueDate !== undefined) body.due_date = params.dueDate;
    if (params.confidential !== undefined) body.confidential = params.confidential;
    if (params.weight !== undefined) body.weight = params.weight;

    let response = await this.api.put(
      `/projects/${encodeURIComponent(String(projectId))}/issues/${issueIid}`,
      body,
      { headers: this.headers() }
    );
    return response.data;
  }

  async deleteIssue(projectId: string | number, issueIid: number): Promise<void> {
    await this.api.delete(
      `/projects/${encodeURIComponent(String(projectId))}/issues/${issueIid}`,
      { headers: this.headers() }
    );
  }

  // ── Merge Requests ────────────────────────────────────────

  async listMergeRequests(params: {
    projectId?: string | number;
    state?: string;
    labels?: string;
    milestone?: string;
    authorId?: number;
    assigneeId?: number;
    reviewerId?: number;
    sourceBranch?: string;
    targetBranch?: string;
    search?: string;
    orderBy?: string;
    sort?: string;
    perPage?: number;
    page?: number;
    scope?: string;
    createdAfter?: string;
    updatedAfter?: string;
  } = {}): Promise<{ mergeRequests: any[]; totalPages: number }> {
    let queryParams: Record<string, any> = {};
    if (params.state) queryParams.state = params.state;
    if (params.labels) queryParams.labels = params.labels;
    if (params.milestone) queryParams.milestone = params.milestone;
    if (params.authorId) queryParams.author_id = params.authorId;
    if (params.assigneeId) queryParams.assignee_id = params.assigneeId;
    if (params.reviewerId) queryParams.reviewer_id = params.reviewerId;
    if (params.sourceBranch) queryParams.source_branch = params.sourceBranch;
    if (params.targetBranch) queryParams.target_branch = params.targetBranch;
    if (params.search) queryParams.search = params.search;
    if (params.orderBy) queryParams.order_by = params.orderBy;
    if (params.sort) queryParams.sort = params.sort;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;
    if (params.scope) queryParams.scope = params.scope;
    if (params.createdAfter) queryParams.created_after = params.createdAfter;
    if (params.updatedAfter) queryParams.updated_after = params.updatedAfter;

    let url = params.projectId
      ? `/projects/${encodeURIComponent(String(params.projectId))}/merge_requests`
      : '/merge_requests';

    let response = await this.api.get(url, {
      params: queryParams,
      headers: this.headers()
    });

    let totalPages = parseInt(response.headers?.['x-total-pages'] || '1', 10);
    return { mergeRequests: response.data, totalPages };
  }

  async getMergeRequest(projectId: string | number, mrIid: number): Promise<any> {
    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/merge_requests/${mrIid}`,
      { headers: this.headers() }
    );
    return response.data;
  }

  async createMergeRequest(projectId: string | number, params: {
    sourceBranch: string;
    targetBranch: string;
    title: string;
    description?: string;
    assigneeIds?: number[];
    reviewerIds?: number[];
    labels?: string;
    milestoneId?: number;
    squash?: boolean;
    removeSourceBranch?: boolean;
    allowCollaboration?: boolean;
  }): Promise<any> {
    let body: Record<string, any> = {
      source_branch: params.sourceBranch,
      target_branch: params.targetBranch,
      title: params.title
    };
    if (params.description) body.description = params.description;
    if (params.assigneeIds) body.assignee_ids = params.assigneeIds;
    if (params.reviewerIds) body.reviewer_ids = params.reviewerIds;
    if (params.labels) body.labels = params.labels;
    if (params.milestoneId) body.milestone_id = params.milestoneId;
    if (params.squash !== undefined) body.squash = params.squash;
    if (params.removeSourceBranch !== undefined) body.remove_source_branch = params.removeSourceBranch;
    if (params.allowCollaboration !== undefined) body.allow_collaboration = params.allowCollaboration;

    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/merge_requests`,
      body,
      { headers: this.headers() }
    );
    return response.data;
  }

  async updateMergeRequest(projectId: string | number, mrIid: number, params: {
    title?: string;
    description?: string;
    assigneeIds?: number[];
    reviewerIds?: number[];
    labels?: string;
    milestoneId?: number;
    stateEvent?: string;
    targetBranch?: string;
    squash?: boolean;
    removeSourceBranch?: boolean;
  }): Promise<any> {
    let body: Record<string, any> = {};
    if (params.title) body.title = params.title;
    if (params.description !== undefined) body.description = params.description;
    if (params.assigneeIds) body.assignee_ids = params.assigneeIds;
    if (params.reviewerIds) body.reviewer_ids = params.reviewerIds;
    if (params.labels !== undefined) body.labels = params.labels;
    if (params.milestoneId) body.milestone_id = params.milestoneId;
    if (params.stateEvent) body.state_event = params.stateEvent;
    if (params.targetBranch) body.target_branch = params.targetBranch;
    if (params.squash !== undefined) body.squash = params.squash;
    if (params.removeSourceBranch !== undefined) body.remove_source_branch = params.removeSourceBranch;

    let response = await this.api.put(
      `/projects/${encodeURIComponent(String(projectId))}/merge_requests/${mrIid}`,
      body,
      { headers: this.headers() }
    );
    return response.data;
  }

  async mergeMergeRequest(projectId: string | number, mrIid: number, params?: {
    mergeCommitMessage?: string;
    squashCommitMessage?: string;
    squash?: boolean;
    shouldRemoveSourceBranch?: boolean;
    sha?: string;
  }): Promise<any> {
    let body: Record<string, any> = {};
    if (params?.mergeCommitMessage) body.merge_commit_message = params.mergeCommitMessage;
    if (params?.squashCommitMessage) body.squash_commit_message = params.squashCommitMessage;
    if (params?.squash !== undefined) body.squash = params.squash;
    if (params?.shouldRemoveSourceBranch !== undefined) body.should_remove_source_branch = params.shouldRemoveSourceBranch;
    if (params?.sha) body.sha = params.sha;

    let response = await this.api.put(
      `/projects/${encodeURIComponent(String(projectId))}/merge_requests/${mrIid}/merge`,
      body,
      { headers: this.headers() }
    );
    return response.data;
  }

  async getMergeRequestChanges(projectId: string | number, mrIid: number): Promise<any> {
    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/merge_requests/${mrIid}/changes`,
      { headers: this.headers() }
    );
    return response.data;
  }

  async approveMergeRequest(projectId: string | number, mrIid: number): Promise<any> {
    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/merge_requests/${mrIid}/approve`,
      {},
      { headers: this.headers() }
    );
    return response.data;
  }

  // ── Pipelines ─────────────────────────────────────────────

  async listPipelines(projectId: string | number, params: {
    status?: string;
    ref?: string;
    sha?: string;
    source?: string;
    orderBy?: string;
    sort?: string;
    perPage?: number;
    page?: number;
    updatedAfter?: string;
  } = {}): Promise<{ pipelines: any[]; totalPages: number }> {
    let queryParams: Record<string, any> = {};
    if (params.status) queryParams.status = params.status;
    if (params.ref) queryParams.ref = params.ref;
    if (params.sha) queryParams.sha = params.sha;
    if (params.source) queryParams.source = params.source;
    if (params.orderBy) queryParams.order_by = params.orderBy;
    if (params.sort) queryParams.sort = params.sort;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;
    if (params.updatedAfter) queryParams.updated_after = params.updatedAfter;

    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/pipelines`,
      { params: queryParams, headers: this.headers() }
    );

    let totalPages = parseInt(response.headers?.['x-total-pages'] || '1', 10);
    return { pipelines: response.data, totalPages };
  }

  async getPipeline(projectId: string | number, pipelineId: number): Promise<any> {
    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/pipelines/${pipelineId}`,
      { headers: this.headers() }
    );
    return response.data;
  }

  async createPipeline(projectId: string | number, ref: string, variables?: Array<{ key: string; value: string; variableType?: string }>): Promise<any> {
    let body: Record<string, any> = { ref };
    if (variables) body.variables = variables;

    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/pipeline`,
      body,
      { headers: this.headers() }
    );
    return response.data;
  }

  async retryPipeline(projectId: string | number, pipelineId: number): Promise<any> {
    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/pipelines/${pipelineId}/retry`,
      {},
      { headers: this.headers() }
    );
    return response.data;
  }

  async cancelPipeline(projectId: string | number, pipelineId: number): Promise<any> {
    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/pipelines/${pipelineId}/cancel`,
      {},
      { headers: this.headers() }
    );
    return response.data;
  }

  // ── Jobs ──────────────────────────────────────────────────

  async listPipelineJobs(projectId: string | number, pipelineId: number, params: {
    scope?: string[];
    perPage?: number;
    page?: number;
  } = {}): Promise<any[]> {
    let queryParams: Record<string, any> = {};
    if (params.scope) queryParams.scope = params.scope;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;

    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/pipelines/${pipelineId}/jobs`,
      { params: queryParams, headers: this.headers() }
    );
    return response.data;
  }

  async getJob(projectId: string | number, jobId: number): Promise<any> {
    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/jobs/${jobId}`,
      { headers: this.headers() }
    );
    return response.data;
  }

  async getJobLog(projectId: string | number, jobId: number): Promise<string> {
    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/jobs/${jobId}/trace`,
      { headers: this.headers() }
    );
    return response.data;
  }

  async retryJob(projectId: string | number, jobId: number): Promise<any> {
    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/jobs/${jobId}/retry`,
      {},
      { headers: this.headers() }
    );
    return response.data;
  }

  async cancelJob(projectId: string | number, jobId: number): Promise<any> {
    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/jobs/${jobId}/cancel`,
      {},
      { headers: this.headers() }
    );
    return response.data;
  }

  // ── Notes (Comments) ─────────────────────────────────────

  async listIssueNotes(projectId: string | number, issueIid: number, params: {
    orderBy?: string;
    sort?: string;
    perPage?: number;
    page?: number;
  } = {}): Promise<any[]> {
    let queryParams: Record<string, any> = {};
    if (params.orderBy) queryParams.order_by = params.orderBy;
    if (params.sort) queryParams.sort = params.sort;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;

    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/issues/${issueIid}/notes`,
      { params: queryParams, headers: this.headers() }
    );
    return response.data;
  }

  async createIssueNote(projectId: string | number, issueIid: number, body: string, confidential?: boolean): Promise<any> {
    let reqBody: Record<string, any> = { body };
    if (confidential !== undefined) reqBody.confidential = confidential;

    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/issues/${issueIid}/notes`,
      reqBody,
      { headers: this.headers() }
    );
    return response.data;
  }

  async listMergeRequestNotes(projectId: string | number, mrIid: number, params: {
    orderBy?: string;
    sort?: string;
    perPage?: number;
    page?: number;
  } = {}): Promise<any[]> {
    let queryParams: Record<string, any> = {};
    if (params.orderBy) queryParams.order_by = params.orderBy;
    if (params.sort) queryParams.sort = params.sort;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;

    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/merge_requests/${mrIid}/notes`,
      { params: queryParams, headers: this.headers() }
    );
    return response.data;
  }

  async createMergeRequestNote(projectId: string | number, mrIid: number, body: string): Promise<any> {
    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/merge_requests/${mrIid}/notes`,
      { body },
      { headers: this.headers() }
    );
    return response.data;
  }

  // ── Labels ────────────────────────────────────────────────

  async listLabels(projectId: string | number, params: {
    search?: string;
    perPage?: number;
    page?: number;
  } = {}): Promise<any[]> {
    let queryParams: Record<string, any> = {};
    if (params.search) queryParams.search = params.search;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;

    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/labels`,
      { params: queryParams, headers: this.headers() }
    );
    return response.data;
  }

  async createLabel(projectId: string | number, params: {
    name: string;
    color: string;
    description?: string;
    priority?: number;
  }): Promise<any> {
    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/labels`,
      params,
      { headers: this.headers() }
    );
    return response.data;
  }

  // ── Milestones ────────────────────────────────────────────

  async listMilestones(projectId: string | number, params: {
    state?: string;
    search?: string;
    perPage?: number;
    page?: number;
  } = {}): Promise<any[]> {
    let queryParams: Record<string, any> = {};
    if (params.state) queryParams.state = params.state;
    if (params.search) queryParams.search = params.search;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;

    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/milestones`,
      { params: queryParams, headers: this.headers() }
    );
    return response.data;
  }

  // ── Groups ────────────────────────────────────────────────

  async listGroups(params: {
    search?: string;
    owned?: boolean;
    orderBy?: string;
    sort?: string;
    perPage?: number;
    page?: number;
  } = {}): Promise<any[]> {
    let queryParams: Record<string, any> = {};
    if (params.search) queryParams.search = params.search;
    if (params.owned !== undefined) queryParams.owned = params.owned;
    if (params.orderBy) queryParams.order_by = params.orderBy;
    if (params.sort) queryParams.sort = params.sort;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;

    let response = await this.api.get('/groups', {
      params: queryParams,
      headers: this.headers()
    });
    return response.data;
  }

  async getGroup(groupId: string | number): Promise<any> {
    let response = await this.api.get(`/groups/${encodeURIComponent(String(groupId))}`, {
      headers: this.headers()
    });
    return response.data;
  }

  // ── Members ───────────────────────────────────────────────

  async listProjectMembers(projectId: string | number, params: {
    query?: string;
    perPage?: number;
    page?: number;
  } = {}): Promise<any[]> {
    let queryParams: Record<string, any> = {};
    if (params.query) queryParams.query = params.query;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;

    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/members`,
      { params: queryParams, headers: this.headers() }
    );
    return response.data;
  }

  async addProjectMember(projectId: string | number, userId: number, accessLevel: number, expiresAt?: string): Promise<any> {
    let body: Record<string, any> = {
      user_id: userId,
      access_level: accessLevel
    };
    if (expiresAt) body.expires_at = expiresAt;

    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/members`,
      body,
      { headers: this.headers() }
    );
    return response.data;
  }

  // ── Releases ──────────────────────────────────────────────

  async listReleases(projectId: string | number, params: {
    perPage?: number;
    page?: number;
    orderBy?: string;
    sort?: string;
  } = {}): Promise<any[]> {
    let queryParams: Record<string, any> = {};
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;
    if (params.orderBy) queryParams.order_by = params.orderBy;
    if (params.sort) queryParams.sort = params.sort;

    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/releases`,
      { params: queryParams, headers: this.headers() }
    );
    return response.data;
  }

  async createRelease(projectId: string | number, params: {
    tagName: string;
    name?: string;
    description?: string;
    ref?: string;
    milestones?: string[];
    releasedAt?: string;
  }): Promise<any> {
    let body: Record<string, any> = {
      tag_name: params.tagName
    };
    if (params.name) body.name = params.name;
    if (params.description) body.description = params.description;
    if (params.ref) body.ref = params.ref;
    if (params.milestones) body.milestones = params.milestones;
    if (params.releasedAt) body.released_at = params.releasedAt;

    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/releases`,
      body,
      { headers: this.headers() }
    );
    return response.data;
  }

  // ── Search ────────────────────────────────────────────────

  async search(params: {
    scope: string;
    search: string;
    projectId?: string | number;
    groupId?: string | number;
  }): Promise<any[]> {
    let queryParams: Record<string, any> = {
      scope: params.scope,
      search: params.search
    };

    let url = '/search';
    if (params.projectId) {
      url = `/projects/${encodeURIComponent(String(params.projectId))}/search`;
    } else if (params.groupId) {
      url = `/groups/${encodeURIComponent(String(params.groupId))}/search`;
    }

    let response = await this.api.get(url, {
      params: queryParams,
      headers: this.headers()
    });
    return response.data;
  }

  // ── Webhooks ──────────────────────────────────────────────

  async createProjectWebhook(projectId: string | number, params: {
    url: string;
    token?: string;
    pushEvents?: boolean;
    tagPushEvents?: boolean;
    mergeRequestsEvents?: boolean;
    issuesEvents?: boolean;
    noteEvents?: boolean;
    pipelineEvents?: boolean;
    jobEvents?: boolean;
    deploymentEvents?: boolean;
    wikiPageEvents?: boolean;
    releasesEvents?: boolean;
    confidentialIssuesEvents?: boolean;
    confidentialNoteEvents?: boolean;
  }): Promise<any> {
    let body: Record<string, any> = { url: params.url };
    if (params.token) body.token = params.token;
    if (params.pushEvents !== undefined) body.push_events = params.pushEvents;
    if (params.tagPushEvents !== undefined) body.tag_push_events = params.tagPushEvents;
    if (params.mergeRequestsEvents !== undefined) body.merge_requests_events = params.mergeRequestsEvents;
    if (params.issuesEvents !== undefined) body.issues_events = params.issuesEvents;
    if (params.noteEvents !== undefined) body.note_events = params.noteEvents;
    if (params.pipelineEvents !== undefined) body.pipeline_events = params.pipelineEvents;
    if (params.jobEvents !== undefined) body.job_events = params.jobEvents;
    if (params.deploymentEvents !== undefined) body.deployment_events = params.deploymentEvents;
    if (params.wikiPageEvents !== undefined) body.wiki_page_events = params.wikiPageEvents;
    if (params.releasesEvents !== undefined) body.releases_events = params.releasesEvents;
    if (params.confidentialIssuesEvents !== undefined) body.confidential_issues_events = params.confidentialIssuesEvents;
    if (params.confidentialNoteEvents !== undefined) body.confidential_note_events = params.confidentialNoteEvents;

    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/hooks`,
      body,
      { headers: this.headers() }
    );
    return response.data;
  }

  async deleteProjectWebhook(projectId: string | number, hookId: number): Promise<void> {
    await this.api.delete(
      `/projects/${encodeURIComponent(String(projectId))}/hooks/${hookId}`,
      { headers: this.headers() }
    );
  }

  // ── Users ─────────────────────────────────────────────────

  async getCurrentUser(): Promise<any> {
    let response = await this.api.get('/user', {
      headers: this.headers()
    });
    return response.data;
  }

  async listUsers(params: {
    search?: string;
    username?: string;
    active?: boolean;
    perPage?: number;
    page?: number;
  } = {}): Promise<any[]> {
    let queryParams: Record<string, any> = {};
    if (params.search) queryParams.search = params.search;
    if (params.username) queryParams.username = params.username;
    if (params.active !== undefined) queryParams.active = params.active;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;

    let response = await this.api.get('/users', {
      params: queryParams,
      headers: this.headers()
    });
    return response.data;
  }

  // ── Environments ──────────────────────────────────────────

  async listEnvironments(projectId: string | number, params: {
    name?: string;
    search?: string;
    states?: string;
    perPage?: number;
    page?: number;
  } = {}): Promise<any[]> {
    let queryParams: Record<string, any> = {};
    if (params.name) queryParams.name = params.name;
    if (params.search) queryParams.search = params.search;
    if (params.states) queryParams.states = params.states;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;

    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/environments`,
      { params: queryParams, headers: this.headers() }
    );
    return response.data;
  }

  // ── CI/CD Variables ───────────────────────────────────────

  async listProjectVariables(projectId: string | number): Promise<any[]> {
    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/variables`,
      { headers: this.headers() }
    );
    return response.data;
  }

  async createProjectVariable(projectId: string | number, params: {
    key: string;
    value: string;
    variableType?: string;
    protected?: boolean;
    masked?: boolean;
    environmentScope?: string;
  }): Promise<any> {
    let body: Record<string, any> = {
      key: params.key,
      value: params.value
    };
    if (params.variableType) body.variable_type = params.variableType;
    if (params.protected !== undefined) body.protected = params.protected;
    if (params.masked !== undefined) body.masked = params.masked;
    if (params.environmentScope) body.environment_scope = params.environmentScope;

    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/variables`,
      body,
      { headers: this.headers() }
    );
    return response.data;
  }

  // ── Tags ──────────────────────────────────────────────────

  async listTags(projectId: string | number, params: {
    search?: string;
    orderBy?: string;
    sort?: string;
    perPage?: number;
    page?: number;
  } = {}): Promise<any[]> {
    let queryParams: Record<string, any> = {};
    if (params.search) queryParams.search = params.search;
    if (params.orderBy) queryParams.order_by = params.orderBy;
    if (params.sort) queryParams.sort = params.sort;
    if (params.perPage) queryParams.per_page = params.perPage;
    if (params.page) queryParams.page = params.page;

    let response = await this.api.get(
      `/projects/${encodeURIComponent(String(projectId))}/repository/tags`,
      { params: queryParams, headers: this.headers() }
    );
    return response.data;
  }

  async createTag(projectId: string | number, params: {
    tagName: string;
    ref: string;
    message?: string;
    releaseDescription?: string;
  }): Promise<any> {
    let body: Record<string, any> = {
      tag_name: params.tagName,
      ref: params.ref
    };
    if (params.message) body.message = params.message;
    if (params.releaseDescription) body.release_description = params.releaseDescription;

    let response = await this.api.post(
      `/projects/${encodeURIComponent(String(projectId))}/repository/tags`,
      body,
      { headers: this.headers() }
    );
    return response.data;
  }
}
