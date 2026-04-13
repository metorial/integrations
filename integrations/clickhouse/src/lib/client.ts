import { createAxios } from 'slates';

export class ClickHouseClient {
  private axios;

  constructor(private params: { token: string; organizationId: string }) {
    this.axios = createAxios({
      baseURL: 'https://api.clickhouse.cloud/v1',
      headers: {
        Authorization: `Basic ${params.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  private get orgPath() {
    return `/organizations/${this.params.organizationId}`;
  }

  private servicePath(serviceId: string) {
    return `${this.orgPath}/services/${serviceId}`;
  }

  // ── Organization ──────────────────────────────────────────

  async getOrganization() {
    let res = await this.axios.get(this.orgPath);
    return res.data.result;
  }

  async updateOrganization(body: Record<string, any>) {
    let res = await this.axios.patch(this.orgPath, body);
    return res.data.result;
  }

  async listActivities(params?: { fromDate?: string; toDate?: string }) {
    let res = await this.axios.get(`${this.orgPath}/activities`, {
      params: {
        from_date: params?.fromDate,
        to_date: params?.toDate
      }
    });
    return res.data.result;
  }

  // ── Members ───────────────────────────────────────────────

  async listMembers() {
    let res = await this.axios.get(`${this.orgPath}/members`);
    return res.data.result;
  }

  async getMember(userId: string) {
    let res = await this.axios.get(`${this.orgPath}/members/${userId}`);
    return res.data.result;
  }

  async updateMember(userId: string, body: Record<string, any>) {
    let res = await this.axios.patch(`${this.orgPath}/members/${userId}`, body);
    return res.data.result;
  }

  async removeMember(userId: string) {
    let res = await this.axios.delete(`${this.orgPath}/members/${userId}`);
    return res.data;
  }

  // ── Invitations ───────────────────────────────────────────

  async listInvitations() {
    let res = await this.axios.get(`${this.orgPath}/invitations`);
    return res.data.result;
  }

  async createInvitation(body: { email: string; role?: string; assignedRoleIds?: string[] }) {
    let res = await this.axios.post(`${this.orgPath}/invitations`, body);
    return res.data.result;
  }

  async deleteInvitation(invitationId: string) {
    let res = await this.axios.delete(`${this.orgPath}/invitations/${invitationId}`);
    return res.data;
  }

  // ── Services ──────────────────────────────────────────────

  async listServices(filter?: string[]) {
    let res = await this.axios.get(`${this.orgPath}/services`, {
      params: filter ? { filter } : undefined
    });
    return res.data.result;
  }

  async getService(serviceId: string) {
    let res = await this.axios.get(this.servicePath(serviceId));
    return res.data.result;
  }

  async createService(body: Record<string, any>) {
    let res = await this.axios.post(`${this.orgPath}/services`, body);
    return res.data.result;
  }

  async updateService(serviceId: string, body: Record<string, any>) {
    let res = await this.axios.patch(this.servicePath(serviceId), body);
    return res.data.result;
  }

  async deleteService(serviceId: string) {
    let res = await this.axios.delete(this.servicePath(serviceId));
    return res.data;
  }

  async updateServiceState(serviceId: string, command: 'start' | 'stop') {
    let res = await this.axios.patch(`${this.servicePath(serviceId)}/state`, { command });
    return res.data.result;
  }

  async updateServiceScaling(serviceId: string, body: Record<string, any>) {
    let res = await this.axios.patch(`${this.servicePath(serviceId)}/scaling`, body);
    return res.data.result;
  }

  async resetServicePassword(serviceId: string) {
    let res = await this.axios.patch(`${this.servicePath(serviceId)}/password`);
    return res.data.result;
  }

  // ── Backups ───────────────────────────────────────────────

  async listBackups(serviceId: string) {
    let res = await this.axios.get(`${this.servicePath(serviceId)}/backups`);
    return res.data.result;
  }

  async getBackup(serviceId: string, backupId: string) {
    let res = await this.axios.get(`${this.servicePath(serviceId)}/backups/${backupId}`);
    return res.data.result;
  }

  async getBackupConfiguration(serviceId: string) {
    let res = await this.axios.get(`${this.servicePath(serviceId)}/backupConfiguration`);
    return res.data.result;
  }

  async updateBackupConfiguration(serviceId: string, body: Record<string, any>) {
    let res = await this.axios.patch(
      `${this.servicePath(serviceId)}/backupConfiguration`,
      body
    );
    return res.data.result;
  }

  // ── API Keys ──────────────────────────────────────────────

  async listApiKeys() {
    let res = await this.axios.get(`${this.orgPath}/keys`);
    return res.data.result;
  }

  async createApiKey(body: Record<string, any>) {
    let res = await this.axios.post(`${this.orgPath}/keys`, body);
    return res.data.result;
  }

  async getApiKey(keyId: string) {
    let res = await this.axios.get(`${this.orgPath}/keys/${keyId}`);
    return res.data.result;
  }

  async updateApiKey(keyId: string, body: Record<string, any>) {
    let res = await this.axios.patch(`${this.orgPath}/keys/${keyId}`, body);
    return res.data.result;
  }

  async deleteApiKey(keyId: string) {
    let res = await this.axios.delete(`${this.orgPath}/keys/${keyId}`);
    return res.data;
  }

  // ── ClickPipes ────────────────────────────────────────────

  async listClickPipes(serviceId: string) {
    let res = await this.axios.get(`${this.servicePath(serviceId)}/clickpipes`);
    return res.data.result;
  }

  async getClickPipe(serviceId: string, clickpipeId: string) {
    let res = await this.axios.get(`${this.servicePath(serviceId)}/clickpipes/${clickpipeId}`);
    return res.data.result;
  }

  async createClickPipe(serviceId: string, body: Record<string, any>) {
    let res = await this.axios.post(`${this.servicePath(serviceId)}/clickpipes`, body);
    return res.data.result;
  }

  async updateClickPipe(serviceId: string, clickpipeId: string, body: Record<string, any>) {
    let res = await this.axios.patch(
      `${this.servicePath(serviceId)}/clickpipes/${clickpipeId}`,
      body
    );
    return res.data.result;
  }

  async deleteClickPipe(serviceId: string, clickpipeId: string) {
    let res = await this.axios.delete(
      `${this.servicePath(serviceId)}/clickpipes/${clickpipeId}`
    );
    return res.data;
  }

  async updateClickPipeState(serviceId: string, clickpipeId: string, state: string) {
    let res = await this.axios.patch(
      `${this.servicePath(serviceId)}/clickpipes/${clickpipeId}/state`,
      { state }
    );
    return res.data.result;
  }

  async updateClickPipeScaling(
    serviceId: string,
    clickpipeId: string,
    body: Record<string, any>
  ) {
    let res = await this.axios.patch(
      `${this.servicePath(serviceId)}/clickpipes/${clickpipeId}/scaling`,
      body
    );
    return res.data.result;
  }

  // ── Usage / Metrics ───────────────────────────────────────

  async getUsageCost(fromDate: string, toDate: string, filter?: string[]) {
    let res = await this.axios.get(`${this.orgPath}/usageCost`, {
      params: {
        from_date: fromDate,
        to_date: toDate,
        ...(filter ? { filter } : {})
      }
    });
    return res.data.result;
  }

  async getPrometheusMetrics(serviceId?: string) {
    let path = serviceId
      ? `${this.servicePath(serviceId)}/prometheus`
      : `${this.orgPath}/prometheus`;
    let res = await this.axios.get(path);
    return res.data;
  }

  // ── Private Endpoints ─────────────────────────────────────

  async getPrivateEndpointConfig(serviceId: string) {
    let res = await this.axios.get(`${this.servicePath(serviceId)}/privateEndpointConfig`);
    return res.data.result;
  }

  async listReversePrivateEndpoints() {
    let res = await this.axios.get(`${this.orgPath}/reversePrivateEndpoints`);
    return res.data.result;
  }

  async createReversePrivateEndpoint(body: { name: string; region: string }) {
    let res = await this.axios.post(`${this.orgPath}/reversePrivateEndpoints`, body);
    return res.data.result;
  }

  async deleteReversePrivateEndpoint(endpointId: string) {
    let res = await this.axios.delete(`${this.orgPath}/reversePrivateEndpoints/${endpointId}`);
    return res.data;
  }

  // ── BYOC ──────────────────────────────────────────────────

  async createByocInfrastructure(body: Record<string, any>) {
    let res = await this.axios.post(`${this.orgPath}/byocInfrastructure`, body);
    return res.data.result;
  }

  async updateByocInfrastructure(byocId: string, body: Record<string, any>) {
    let res = await this.axios.patch(`${this.orgPath}/byocInfrastructure/${byocId}`, body);
    return res.data.result;
  }

  async deleteByocInfrastructure(byocId: string) {
    let res = await this.axios.delete(`${this.orgPath}/byocInfrastructure/${byocId}`);
    return res.data;
  }

  // ── ClickStack ────────────────────────────────────────────

  async listDashboards(serviceId: string) {
    let res = await this.axios.get(`${this.servicePath(serviceId)}/clickstack/dashboards`);
    return res.data.result;
  }

  async createDashboard(serviceId: string, body: Record<string, any>) {
    let res = await this.axios.post(
      `${this.servicePath(serviceId)}/clickstack/dashboards`,
      body
    );
    return res.data.result;
  }

  async getDashboard(serviceId: string, dashboardId: string) {
    let res = await this.axios.get(
      `${this.servicePath(serviceId)}/clickstack/dashboards/${dashboardId}`
    );
    return res.data.result;
  }

  async updateDashboard(serviceId: string, dashboardId: string, body: Record<string, any>) {
    let res = await this.axios.put(
      `${this.servicePath(serviceId)}/clickstack/dashboards/${dashboardId}`,
      body
    );
    return res.data.result;
  }

  async deleteDashboard(serviceId: string, dashboardId: string) {
    let res = await this.axios.delete(
      `${this.servicePath(serviceId)}/clickstack/dashboards/${dashboardId}`
    );
    return res.data;
  }

  async listAlerts(serviceId: string) {
    let res = await this.axios.get(`${this.servicePath(serviceId)}/clickstack/alerts`);
    return res.data.result;
  }

  async createAlert(serviceId: string, body: Record<string, any>) {
    let res = await this.axios.post(`${this.servicePath(serviceId)}/clickstack/alerts`, body);
    return res.data.result;
  }

  async getAlert(serviceId: string, alertId: string) {
    let res = await this.axios.get(
      `${this.servicePath(serviceId)}/clickstack/alerts/${alertId}`
    );
    return res.data.result;
  }

  async updateAlert(serviceId: string, alertId: string, body: Record<string, any>) {
    let res = await this.axios.put(
      `${this.servicePath(serviceId)}/clickstack/alerts/${alertId}`,
      body
    );
    return res.data.result;
  }

  async deleteAlert(serviceId: string, alertId: string) {
    let res = await this.axios.delete(
      `${this.servicePath(serviceId)}/clickstack/alerts/${alertId}`
    );
    return res.data;
  }

  async listClickStackSources(serviceId: string) {
    let res = await this.axios.get(`${this.servicePath(serviceId)}/clickstack/sources`);
    return res.data.result;
  }

  async listClickStackWebhooks(serviceId: string) {
    let res = await this.axios.get(`${this.servicePath(serviceId)}/clickstack/webhooks`);
    return res.data.result;
  }

  // ── Query Endpoints ───────────────────────────────────────

  async getQueryEndpoint(serviceId: string) {
    let res = await this.axios.get(`${this.servicePath(serviceId)}/queryEndpoint`);
    return res.data.result;
  }

  async upsertQueryEndpoint(serviceId: string, body: Record<string, any>) {
    let res = await this.axios.post(`${this.servicePath(serviceId)}/queryEndpoint`, body);
    return res.data.result;
  }

  async deleteQueryEndpoint(serviceId: string) {
    let res = await this.axios.delete(`${this.servicePath(serviceId)}/queryEndpoint`);
    return res.data;
  }
}
