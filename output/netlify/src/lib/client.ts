import { createAxios } from 'slates';
import type { AxiosInstance } from 'axios';

export class Client {
  private api: AxiosInstance;

  constructor(private config: { token: string }) {
    this.api = createAxios({
      baseURL: 'https://api.netlify.com/api/v1',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // ---- Sites ----

  async listSites(params?: { filter?: string; page?: number; perPage?: number }) {
    let response = await this.api.get('/sites', {
      params: {
        filter: params?.filter,
        page: params?.page,
        per_page: params?.perPage,
      },
    });
    return response.data;
  }

  async getSite(siteId: string) {
    let response = await this.api.get(`/sites/${siteId}`);
    return response.data;
  }

  async createSite(body: Record<string, any>, accountSlug?: string) {
    let url = accountSlug ? `/${accountSlug}/sites` : '/sites';
    let response = await this.api.post(url, body);
    return response.data;
  }

  async updateSite(siteId: string, body: Record<string, any>) {
    let response = await this.api.patch(`/sites/${siteId}`, body);
    return response.data;
  }

  async deleteSite(siteId: string) {
    await this.api.delete(`/sites/${siteId}`);
  }

  // ---- Deploys ----

  async listDeploys(siteId: string, params?: { page?: number; perPage?: number }) {
    let response = await this.api.get(`/sites/${siteId}/deploys`, {
      params: {
        page: params?.page,
        per_page: params?.perPage,
      },
    });
    return response.data;
  }

  async getDeploy(deployId: string) {
    let response = await this.api.get(`/deploys/${deployId}`);
    return response.data;
  }

  async cancelDeploy(deployId: string) {
    let response = await this.api.post(`/deploys/${deployId}/cancel`);
    return response.data;
  }

  async lockDeploy(deployId: string) {
    let response = await this.api.post(`/deploys/${deployId}/lock`);
    return response.data;
  }

  async unlockDeploy(deployId: string) {
    let response = await this.api.post(`/deploys/${deployId}/unlock`);
    return response.data;
  }

  async restoreDeploy(siteId: string, deployId: string) {
    let response = await this.api.post(`/sites/${siteId}/deploys/${deployId}/restore`);
    return response.data;
  }

  async rollbackDeploy(siteId: string, deployId: string) {
    let response = await this.api.put(`/sites/${siteId}/deploys/${deployId}/rollback`);
    return response.data;
  }

  async deleteDeploy(deployId: string) {
    await this.api.delete(`/deploys/${deployId}`);
  }

  // ---- Environment Variables ----

  async listEnvVars(accountId: string, siteId?: string) {
    let params: Record<string, string> = {};
    if (siteId) {
      params.site_id = siteId;
    }
    let response = await this.api.get(`/accounts/${accountId}/env`, { params });
    return response.data;
  }

  async getEnvVar(accountId: string, key: string, siteId?: string) {
    let params: Record<string, string> = {};
    if (siteId) {
      params.site_id = siteId;
    }
    let response = await this.api.get(`/accounts/${accountId}/env/${encodeURIComponent(key)}`, { params });
    return response.data;
  }

  async createEnvVars(accountId: string, envVars: Array<{ key: string; values: Array<{ value: string; context: string; id?: string }> }>, siteId?: string) {
    let params: Record<string, string> = {};
    if (siteId) {
      params.site_id = siteId;
    }
    let response = await this.api.post(`/accounts/${accountId}/env`, envVars, { params });
    return response.data;
  }

  async updateEnvVar(accountId: string, key: string, body: { key: string; values: Array<{ value: string; context: string; id?: string }> }, siteId?: string) {
    let params: Record<string, string> = {};
    if (siteId) {
      params.site_id = siteId;
    }
    let response = await this.api.put(`/accounts/${accountId}/env/${encodeURIComponent(key)}`, body, { params });
    return response.data;
  }

  async deleteEnvVar(accountId: string, key: string, siteId?: string) {
    let params: Record<string, string> = {};
    if (siteId) {
      params.site_id = siteId;
    }
    await this.api.delete(`/accounts/${accountId}/env/${encodeURIComponent(key)}`, { params });
  }

  // ---- Forms ----

  async listForms(siteId: string) {
    let response = await this.api.get(`/sites/${siteId}/forms`);
    return response.data;
  }

  async deleteForm(siteId: string, formId: string) {
    await this.api.delete(`/sites/${siteId}/forms/${formId}`);
  }

  async listFormSubmissions(formId: string, params?: { page?: number; perPage?: number }) {
    let response = await this.api.get(`/forms/${formId}/submissions`, {
      params: {
        page: params?.page,
        per_page: params?.perPage,
      },
    });
    return response.data;
  }

  async listSiteSubmissions(siteId: string, params?: { page?: number; perPage?: number }) {
    let response = await this.api.get(`/sites/${siteId}/submissions`, {
      params: {
        page: params?.page,
        per_page: params?.perPage,
      },
    });
    return response.data;
  }

  async deleteSubmission(submissionId: string) {
    await this.api.delete(`/submissions/${submissionId}`);
  }

  // ---- DNS Zones ----

  async listDnsZones(params?: { accountSlug?: string }) {
    let response = await this.api.get('/dns_zones', {
      params: {
        account_slug: params?.accountSlug,
      },
    });
    return response.data;
  }

  async getDnsZone(zoneId: string) {
    let response = await this.api.get(`/dns_zones/${zoneId}`);
    return response.data;
  }

  async createDnsZone(body: { name: string; account_slug: string }) {
    let response = await this.api.post('/dns_zones', body);
    return response.data;
  }

  async deleteDnsZone(zoneId: string) {
    await this.api.delete(`/dns_zones/${zoneId}`);
  }

  // ---- DNS Records ----

  async listDnsRecords(zoneId: string) {
    let response = await this.api.get(`/dns_zones/${zoneId}/dns_records`);
    return response.data;
  }

  async getDnsRecord(zoneId: string, recordId: string) {
    let response = await this.api.get(`/dns_zones/${zoneId}/dns_records/${recordId}`);
    return response.data;
  }

  async createDnsRecord(zoneId: string, body: { type: string; hostname: string; value: string; ttl?: number; priority?: number }) {
    let response = await this.api.post(`/dns_zones/${zoneId}/dns_records`, body);
    return response.data;
  }

  async deleteDnsRecord(zoneId: string, recordId: string) {
    await this.api.delete(`/dns_zones/${zoneId}/dns_records/${recordId}`);
  }

  // ---- Snippets ----

  async listSnippets(siteId: string) {
    let response = await this.api.get(`/sites/${siteId}/snippets`);
    return response.data;
  }

  async getSnippet(siteId: string, snippetId: string) {
    let response = await this.api.get(`/sites/${siteId}/snippets/${snippetId}`);
    return response.data;
  }

  async createSnippet(siteId: string, body: { title: string; general: string; general_position: string; goal?: string; goal_position?: string }) {
    let response = await this.api.post(`/sites/${siteId}/snippets`, body);
    return response.data;
  }

  async updateSnippet(siteId: string, snippetId: string, body: { title?: string; general?: string; general_position?: string; goal?: string; goal_position?: string }) {
    let response = await this.api.put(`/sites/${siteId}/snippets/${snippetId}`, body);
    return response.data;
  }

  async deleteSnippet(siteId: string, snippetId: string) {
    await this.api.delete(`/sites/${siteId}/snippets/${snippetId}`);
  }

  // ---- Split Tests ----

  async listSplitTests(siteId: string) {
    let response = await this.api.get(`/sites/${siteId}/split_tests`);
    return response.data;
  }

  async getSplitTest(siteId: string, splitTestId: string) {
    let response = await this.api.get(`/sites/${siteId}/split_tests/${splitTestId}`);
    return response.data;
  }

  async createSplitTest(siteId: string, body: { branch_tests: Record<string, number> }) {
    let response = await this.api.post(`/sites/${siteId}/split_tests`, body);
    return response.data;
  }

  async updateSplitTest(siteId: string, splitTestId: string, body: { branch_tests: Record<string, number> }) {
    let response = await this.api.put(`/sites/${siteId}/split_tests/${splitTestId}`, body);
    return response.data;
  }

  async enableSplitTest(siteId: string, splitTestId: string) {
    let response = await this.api.post(`/sites/${siteId}/split_tests/${splitTestId}/enable`);
    return response.data;
  }

  async disableSplitTest(siteId: string, splitTestId: string) {
    let response = await this.api.post(`/sites/${siteId}/split_tests/${splitTestId}/disable`);
    return response.data;
  }

  // ---- Hooks ----

  async listHooks(siteId: string) {
    let response = await this.api.get(`/hooks`, {
      params: { site_id: siteId },
    });
    return response.data;
  }

  async getHook(hookId: string) {
    let response = await this.api.get(`/hooks/${hookId}`);
    return response.data;
  }

  async createHook(body: { site_id: string; type: string; event: string; data: Record<string, any> }) {
    let response = await this.api.post('/hooks', body);
    return response.data;
  }

  async updateHook(hookId: string, body: Record<string, any>) {
    let response = await this.api.put(`/hooks/${hookId}`, body);
    return response.data;
  }

  async deleteHook(hookId: string) {
    await this.api.delete(`/hooks/${hookId}`);
  }

  async listHookTypes() {
    let response = await this.api.get('/hooks/types');
    return response.data;
  }

  // ---- Build Hooks ----

  async listBuildHooks(siteId: string) {
    let response = await this.api.get(`/sites/${siteId}/build_hooks`);
    return response.data;
  }

  async createBuildHook(siteId: string, body: { title: string; branch?: string }) {
    let response = await this.api.post(`/sites/${siteId}/build_hooks`, body);
    return response.data;
  }

  async deleteBuildHook(siteId: string, buildHookId: string) {
    await this.api.delete(`/sites/${siteId}/build_hooks/${buildHookId}`);
  }

  // ---- CDN Purge ----

  async purgeCache(siteId: string) {
    await this.api.post(`/purge`, { site_id: siteId });
  }

  // ---- User ----

  async getCurrentUser() {
    let response = await this.api.get('/user');
    return response.data;
  }

  async listAccounts() {
    let response = await this.api.get('/accounts');
    return response.data;
  }

  // ---- Site Metadata ----

  async getSiteMetadata(siteId: string) {
    let response = await this.api.get(`/sites/${siteId}/metadata`);
    return response.data;
  }

  async updateSiteMetadata(siteId: string, metadata: Record<string, any>) {
    let response = await this.api.put(`/sites/${siteId}/metadata`, metadata);
    return response.data;
  }
}
