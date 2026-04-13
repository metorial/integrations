import { createAxios } from 'slates';

export class MailchimpClient {
  private token: string;
  private serverPrefix: string;
  private axios: ReturnType<typeof createAxios>;

  constructor(config: { token: string; serverPrefix: string }) {
    this.token = config.token;
    this.serverPrefix = config.serverPrefix;
    this.axios = createAxios({
      baseURL: `https://${this.serverPrefix}.api.mailchimp.com/3.0`,
    });
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  // ─── Account ────────────────────────────────────────────────

  async getAccountInfo() {
    let response = await this.axios.get('/', { headers: this.headers });
    return response.data;
  }

  async ping() {
    let response = await this.axios.get('/ping', { headers: this.headers });
    return response.data;
  }

  // ─── Lists (Audiences) ─────────────────────────────────────

  async getLists(params?: { count?: number; offset?: number }) {
    let response = await this.axios.get('/lists', {
      headers: this.headers,
      params: { count: params?.count ?? 100, offset: params?.offset ?? 0 },
    });
    return response.data;
  }

  async getList(listId: string) {
    let response = await this.axios.get(`/lists/${listId}`, { headers: this.headers });
    return response.data;
  }

  async createList(data: Record<string, any>) {
    let response = await this.axios.post('/lists', data, { headers: this.headers });
    return response.data;
  }

  async updateList(listId: string, data: Record<string, any>) {
    let response = await this.axios.patch(`/lists/${listId}`, data, { headers: this.headers });
    return response.data;
  }

  async deleteList(listId: string) {
    await this.axios.delete(`/lists/${listId}`, { headers: this.headers });
  }

  // ─── Members ────────────────────────────────────────────────

  async getMembers(listId: string, params?: { count?: number; offset?: number; status?: string; sinceLastChanged?: string }) {
    let response = await this.axios.get(`/lists/${listId}/members`, {
      headers: this.headers,
      params: {
        count: params?.count ?? 100,
        offset: params?.offset ?? 0,
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.sinceLastChanged ? { since_last_changed: params.sinceLastChanged } : {}),
      },
    });
    return response.data;
  }

  async getMember(listId: string, subscriberHash: string) {
    let response = await this.axios.get(`/lists/${listId}/members/${subscriberHash}`, { headers: this.headers });
    return response.data;
  }

  async addMember(listId: string, data: Record<string, any>) {
    let response = await this.axios.post(`/lists/${listId}/members`, data, { headers: this.headers });
    return response.data;
  }

  async updateMember(listId: string, subscriberHash: string, data: Record<string, any>) {
    let response = await this.axios.patch(`/lists/${listId}/members/${subscriberHash}`, data, { headers: this.headers });
    return response.data;
  }

  async upsertMember(listId: string, subscriberHash: string, data: Record<string, any>) {
    let response = await this.axios.put(`/lists/${listId}/members/${subscriberHash}`, data, { headers: this.headers });
    return response.data;
  }

  async archiveMember(listId: string, subscriberHash: string) {
    await this.axios.delete(`/lists/${listId}/members/${subscriberHash}`, { headers: this.headers });
  }

  async deleteMemberPermanent(listId: string, subscriberHash: string) {
    await this.axios.post(`/lists/${listId}/members/${subscriberHash}/actions/delete-permanent`, {}, { headers: this.headers });
  }

  // ─── Tags ───────────────────────────────────────────────────

  async getMemberTags(listId: string, subscriberHash: string) {
    let response = await this.axios.get(`/lists/${listId}/members/${subscriberHash}/tags`, { headers: this.headers });
    return response.data;
  }

  async updateMemberTags(listId: string, subscriberHash: string, tags: Array<{ name: string; status: 'active' | 'inactive' }>) {
    let response = await this.axios.post(`/lists/${listId}/members/${subscriberHash}/tags`, { tags }, { headers: this.headers });
    return response.data;
  }

  async searchTags(listId: string, name: string) {
    let response = await this.axios.get(`/lists/${listId}/tag-search`, {
      headers: this.headers,
      params: { name },
    });
    return response.data;
  }

  // ─── Segments ───────────────────────────────────────────────

  async getSegments(listId: string, params?: { count?: number; offset?: number }) {
    let response = await this.axios.get(`/lists/${listId}/segments`, {
      headers: this.headers,
      params: { count: params?.count ?? 100, offset: params?.offset ?? 0 },
    });
    return response.data;
  }

  async getSegment(listId: string, segmentId: string) {
    let response = await this.axios.get(`/lists/${listId}/segments/${segmentId}`, { headers: this.headers });
    return response.data;
  }

  async createSegment(listId: string, data: Record<string, any>) {
    let response = await this.axios.post(`/lists/${listId}/segments`, data, { headers: this.headers });
    return response.data;
  }

  async updateSegment(listId: string, segmentId: string, data: Record<string, any>) {
    let response = await this.axios.patch(`/lists/${listId}/segments/${segmentId}`, data, { headers: this.headers });
    return response.data;
  }

  async deleteSegment(listId: string, segmentId: string) {
    await this.axios.delete(`/lists/${listId}/segments/${segmentId}`, { headers: this.headers });
  }

  // ─── Campaigns ──────────────────────────────────────────────

  async getCampaigns(params?: { count?: number; offset?: number; status?: string; type?: string; sinceCreateTime?: string; sinceSendTime?: string }) {
    let response = await this.axios.get('/campaigns', {
      headers: this.headers,
      params: {
        count: params?.count ?? 100,
        offset: params?.offset ?? 0,
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.type ? { type: params.type } : {}),
        ...(params?.sinceCreateTime ? { since_create_time: params.sinceCreateTime } : {}),
        ...(params?.sinceSendTime ? { since_send_time: params.sinceSendTime } : {}),
      },
    });
    return response.data;
  }

  async getCampaign(campaignId: string) {
    let response = await this.axios.get(`/campaigns/${campaignId}`, { headers: this.headers });
    return response.data;
  }

  async createCampaign(data: Record<string, any>) {
    let response = await this.axios.post('/campaigns', data, { headers: this.headers });
    return response.data;
  }

  async updateCampaign(campaignId: string, data: Record<string, any>) {
    let response = await this.axios.patch(`/campaigns/${campaignId}`, data, { headers: this.headers });
    return response.data;
  }

  async deleteCampaign(campaignId: string) {
    await this.axios.delete(`/campaigns/${campaignId}`, { headers: this.headers });
  }

  async sendCampaign(campaignId: string) {
    await this.axios.post(`/campaigns/${campaignId}/actions/send`, {}, { headers: this.headers });
  }

  async scheduleCampaign(campaignId: string, scheduleTime: string, timewarp?: boolean) {
    await this.axios.post(`/campaigns/${campaignId}/actions/schedule`, {
      schedule_time: scheduleTime,
      timewarp: timewarp ?? false,
    }, { headers: this.headers });
  }

  async unscheduleCampaign(campaignId: string) {
    await this.axios.post(`/campaigns/${campaignId}/actions/unschedule`, {}, { headers: this.headers });
  }

  async cancelCampaign(campaignId: string) {
    await this.axios.post(`/campaigns/${campaignId}/actions/cancel-send`, {}, { headers: this.headers });
  }

  async replicateCampaign(campaignId: string) {
    let response = await this.axios.post(`/campaigns/${campaignId}/actions/replicate`, {}, { headers: this.headers });
    return response.data;
  }

  async sendTestEmail(campaignId: string, testEmails: string[], sendType: 'html' | 'plaintext') {
    await this.axios.post(`/campaigns/${campaignId}/actions/test`, {
      test_emails: testEmails,
      send_type: sendType,
    }, { headers: this.headers });
  }

  async getCampaignContent(campaignId: string) {
    let response = await this.axios.get(`/campaigns/${campaignId}/content`, { headers: this.headers });
    return response.data;
  }

  async setCampaignContent(campaignId: string, data: Record<string, any>) {
    let response = await this.axios.put(`/campaigns/${campaignId}/content`, data, { headers: this.headers });
    return response.data;
  }

  async getSendChecklist(campaignId: string) {
    let response = await this.axios.get(`/campaigns/${campaignId}/send-checklist`, { headers: this.headers });
    return response.data;
  }

  // ─── Templates ──────────────────────────────────────────────

  async getTemplates(params?: { count?: number; offset?: number; type?: string }) {
    let response = await this.axios.get('/templates', {
      headers: this.headers,
      params: {
        count: params?.count ?? 100,
        offset: params?.offset ?? 0,
        ...(params?.type ? { type: params.type } : {}),
      },
    });
    return response.data;
  }

  async getTemplate(templateId: number) {
    let response = await this.axios.get(`/templates/${templateId}`, { headers: this.headers });
    return response.data;
  }

  async createTemplate(data: { name: string; html: string; folderId?: string }) {
    let body: Record<string, any> = { name: data.name, html: data.html };
    if (data.folderId) body.folder_id = data.folderId;
    let response = await this.axios.post('/templates', body, { headers: this.headers });
    return response.data;
  }

  async updateTemplate(templateId: number, data: Record<string, any>) {
    let response = await this.axios.patch(`/templates/${templateId}`, data, { headers: this.headers });
    return response.data;
  }

  async deleteTemplate(templateId: number) {
    await this.axios.delete(`/templates/${templateId}`, { headers: this.headers });
  }

  // ─── Automations ────────────────────────────────────────────

  async getAutomations(params?: { count?: number; offset?: number }) {
    let response = await this.axios.get('/automations', {
      headers: this.headers,
      params: { count: params?.count ?? 100, offset: params?.offset ?? 0 },
    });
    return response.data;
  }

  async getAutomation(workflowId: string) {
    let response = await this.axios.get(`/automations/${workflowId}`, { headers: this.headers });
    return response.data;
  }

  async startAutomation(workflowId: string) {
    await this.axios.post(`/automations/${workflowId}/actions/start`, {}, { headers: this.headers });
  }

  async pauseAutomation(workflowId: string) {
    await this.axios.post(`/automations/${workflowId}/actions/pause`, {}, { headers: this.headers });
  }

  async archiveAutomation(workflowId: string) {
    await this.axios.post(`/automations/${workflowId}/actions/archive`, {}, { headers: this.headers });
  }

  async getAutomationEmails(workflowId: string) {
    let response = await this.axios.get(`/automations/${workflowId}/emails`, { headers: this.headers });
    return response.data;
  }

  async addSubscriberToAutomationQueue(workflowId: string, emailId: string, emailAddress: string) {
    let response = await this.axios.post(`/automations/${workflowId}/emails/${emailId}/queue`, {
      email_address: emailAddress,
    }, { headers: this.headers });
    return response.data;
  }

  async removeSubscriberFromAutomation(workflowId: string, emailAddress: string) {
    let response = await this.axios.post(`/automations/${workflowId}/removed-subscribers`, {
      email_address: emailAddress,
    }, { headers: this.headers });
    return response.data;
  }

  // ─── Reports ────────────────────────────────────────────────

  async getReports(params?: { count?: number; offset?: number; type?: string; sinceSendTime?: string }) {
    let response = await this.axios.get('/reports', {
      headers: this.headers,
      params: {
        count: params?.count ?? 100,
        offset: params?.offset ?? 0,
        ...(params?.type ? { type: params.type } : {}),
        ...(params?.sinceSendTime ? { since_send_time: params.sinceSendTime } : {}),
      },
    });
    return response.data;
  }

  async getCampaignReport(campaignId: string) {
    let response = await this.axios.get(`/reports/${campaignId}`, { headers: this.headers });
    return response.data;
  }

  async getCampaignClickDetails(campaignId: string, params?: { count?: number; offset?: number }) {
    let response = await this.axios.get(`/reports/${campaignId}/click-details`, {
      headers: this.headers,
      params: { count: params?.count ?? 100, offset: params?.offset ?? 0 },
    });
    return response.data;
  }

  async getCampaignOpenDetails(campaignId: string, params?: { count?: number; offset?: number }) {
    let response = await this.axios.get(`/reports/${campaignId}/open-details`, {
      headers: this.headers,
      params: { count: params?.count ?? 100, offset: params?.offset ?? 0 },
    });
    return response.data;
  }

  async getCampaignEmailActivity(campaignId: string, params?: { count?: number; offset?: number }) {
    let response = await this.axios.get(`/reports/${campaignId}/email-activity`, {
      headers: this.headers,
      params: { count: params?.count ?? 100, offset: params?.offset ?? 0 },
    });
    return response.data;
  }

  async getListActivity(listId: string) {
    let response = await this.axios.get(`/lists/${listId}/activity`, { headers: this.headers });
    return response.data;
  }

  async getListGrowthHistory(listId: string, params?: { count?: number; offset?: number }) {
    let response = await this.axios.get(`/lists/${listId}/growth-history`, {
      headers: this.headers,
      params: { count: params?.count ?? 100, offset: params?.offset ?? 0 },
    });
    return response.data;
  }

  // ─── Search ─────────────────────────────────────────────────

  async searchMembers(query: string, listId?: string) {
    let response = await this.axios.get('/search-members', {
      headers: this.headers,
      params: {
        query,
        ...(listId ? { list_id: listId } : {}),
      },
    });
    return response.data;
  }

  async searchCampaigns(query: string) {
    let response = await this.axios.get('/search-campaigns', {
      headers: this.headers,
      params: { query },
    });
    return response.data;
  }

  // ─── Webhooks ───────────────────────────────────────────────

  async getWebhooks(listId: string) {
    let response = await this.axios.get(`/lists/${listId}/webhooks`, { headers: this.headers });
    return response.data;
  }

  async createWebhook(listId: string, data: Record<string, any>) {
    let response = await this.axios.post(`/lists/${listId}/webhooks`, data, { headers: this.headers });
    return response.data;
  }

  async deleteWebhook(listId: string, webhookId: string) {
    await this.axios.delete(`/lists/${listId}/webhooks/${webhookId}`, { headers: this.headers });
  }

  // ─── Events ─────────────────────────────────────────────────

  async addMemberEvent(listId: string, subscriberHash: string, data: { name: string; properties?: Record<string, string> }) {
    await this.axios.post(`/lists/${listId}/members/${subscriberHash}/events`, data, { headers: this.headers });
  }

  // ─── Merge Fields ───────────────────────────────────────────

  async getMergeFields(listId: string, params?: { count?: number; offset?: number }) {
    let response = await this.axios.get(`/lists/${listId}/merge-fields`, {
      headers: this.headers,
      params: { count: params?.count ?? 100, offset: params?.offset ?? 0 },
    });
    return response.data;
  }

  // ─── Interest Categories ────────────────────────────────────

  async getInterestCategories(listId: string) {
    let response = await this.axios.get(`/lists/${listId}/interest-categories`, { headers: this.headers });
    return response.data;
  }

  async getInterests(listId: string, categoryId: string) {
    let response = await this.axios.get(`/lists/${listId}/interest-categories/${categoryId}/interests`, { headers: this.headers });
    return response.data;
  }
}
