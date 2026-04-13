import { createAxios } from 'slates';
import type {
  PaginationParams,
  PaginatedResponse,
  HookdeckSource,
  HookdeckDestination,
  HookdeckConnection,
  HookdeckEvent,
  HookdeckRequest,
  HookdeckIssue,
  HookdeckTransformation,
  HookdeckBookmark,
  HookdeckIssueTrigger,
} from './types';

export class Client {
  private axios;

  constructor(config: { token: string; apiVersion: string }) {
    this.axios = createAxios({
      baseURL: `https://api.hookdeck.com/${config.apiVersion}`,
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // ---- Sources ----

  async listSources(params?: PaginationParams & { name?: string }): Promise<PaginatedResponse<HookdeckSource>> {
    let response = await this.axios.get('/sources', { params });
    return response.data;
  }

  async getSource(sourceId: string): Promise<HookdeckSource> {
    let response = await this.axios.get(`/sources/${sourceId}`);
    return response.data;
  }

  async createSource(data: {
    name: string;
    description?: string;
    type?: string;
    verification?: Record<string, unknown>;
    config?: Record<string, unknown>;
  }): Promise<HookdeckSource> {
    let response = await this.axios.post('/sources', data);
    return response.data;
  }

  async updateSource(sourceId: string, data: {
    name?: string;
    description?: string;
    type?: string;
    verification?: Record<string, unknown>;
    config?: Record<string, unknown>;
  }): Promise<HookdeckSource> {
    let response = await this.axios.put(`/sources/${sourceId}`, data);
    return response.data;
  }

  async deleteSource(sourceId: string): Promise<{ id: string }> {
    let response = await this.axios.delete(`/sources/${sourceId}`);
    return response.data;
  }

  async disableSource(sourceId: string): Promise<HookdeckSource> {
    let response = await this.axios.put(`/sources/${sourceId}/disable`);
    return response.data;
  }

  async enableSource(sourceId: string): Promise<HookdeckSource> {
    let response = await this.axios.put(`/sources/${sourceId}/enable`);
    return response.data;
  }

  // ---- Destinations ----

  async listDestinations(params?: PaginationParams & { name?: string }): Promise<PaginatedResponse<HookdeckDestination>> {
    let response = await this.axios.get('/destinations', { params });
    return response.data;
  }

  async getDestination(destinationId: string): Promise<HookdeckDestination> {
    let response = await this.axios.get(`/destinations/${destinationId}`);
    return response.data;
  }

  async createDestination(data: {
    name: string;
    description?: string;
    type?: string;
    config?: Record<string, unknown>;
  }): Promise<HookdeckDestination> {
    let response = await this.axios.post('/destinations', data);
    return response.data;
  }

  async updateDestination(destinationId: string, data: {
    name?: string;
    description?: string;
    type?: string;
    config?: Record<string, unknown>;
  }): Promise<HookdeckDestination> {
    let response = await this.axios.put(`/destinations/${destinationId}`, data);
    return response.data;
  }

  async deleteDestination(destinationId: string): Promise<{ id: string }> {
    let response = await this.axios.delete(`/destinations/${destinationId}`);
    return response.data;
  }

  async disableDestination(destinationId: string): Promise<HookdeckDestination> {
    let response = await this.axios.put(`/destinations/${destinationId}/disable`);
    return response.data;
  }

  async enableDestination(destinationId: string): Promise<HookdeckDestination> {
    let response = await this.axios.put(`/destinations/${destinationId}/enable`);
    return response.data;
  }

  // ---- Connections ----

  async listConnections(params?: PaginationParams & {
    name?: string;
    source_id?: string;
    destination_id?: string;
  }): Promise<PaginatedResponse<HookdeckConnection>> {
    let response = await this.axios.get('/connections', { params });
    return response.data;
  }

  async getConnection(connectionId: string): Promise<HookdeckConnection> {
    let response = await this.axios.get(`/connections/${connectionId}`);
    return response.data;
  }

  async createConnection(data: {
    name?: string;
    description?: string;
    source_id?: string;
    source?: { name: string; description?: string };
    destination_id?: string;
    destination?: { name: string; description?: string; config?: Record<string, unknown> };
    rules?: Record<string, unknown>[];
  }): Promise<HookdeckConnection> {
    let response = await this.axios.post('/connections', data);
    return response.data;
  }

  async updateConnection(connectionId: string, data: {
    name?: string;
    description?: string;
    rules?: Record<string, unknown>[];
  }): Promise<HookdeckConnection> {
    let response = await this.axios.put(`/connections/${connectionId}`, data);
    return response.data;
  }

  async deleteConnection(connectionId: string): Promise<{ id: string }> {
    let response = await this.axios.delete(`/connections/${connectionId}`);
    return response.data;
  }

  async pauseConnection(connectionId: string): Promise<HookdeckConnection> {
    let response = await this.axios.put(`/connections/${connectionId}/pause`);
    return response.data;
  }

  async unpauseConnection(connectionId: string): Promise<HookdeckConnection> {
    let response = await this.axios.put(`/connections/${connectionId}/unpause`);
    return response.data;
  }

  // ---- Events ----

  async listEvents(params?: PaginationParams & {
    status?: string;
    webhook_id?: string;
    source_id?: string;
    destination_id?: string;
    created_at?: Record<string, string>;
  }): Promise<PaginatedResponse<HookdeckEvent>> {
    let response = await this.axios.get('/events', { params });
    return response.data;
  }

  async getEvent(eventId: string): Promise<HookdeckEvent> {
    let response = await this.axios.get(`/events/${eventId}`);
    return response.data;
  }

  async retryEvent(eventId: string): Promise<HookdeckEvent> {
    let response = await this.axios.post(`/events/${eventId}/retry`);
    return response.data;
  }

  async muteEvent(eventId: string): Promise<HookdeckEvent> {
    let response = await this.axios.put(`/events/${eventId}/mute`);
    return response.data;
  }

  async bulkRetryEvents(query: Record<string, unknown>): Promise<{ id: string }> {
    let response = await this.axios.post('/bulk/events/retry', { query });
    return response.data;
  }

  // ---- Requests ----

  async listRequests(params?: PaginationParams & {
    source_id?: string;
    status?: string;
    rejection_cause?: string;
  }): Promise<PaginatedResponse<HookdeckRequest>> {
    let response = await this.axios.get('/requests', { params });
    return response.data;
  }

  async getRequest(requestId: string): Promise<HookdeckRequest> {
    let response = await this.axios.get(`/requests/${requestId}`);
    return response.data;
  }

  async retryRequest(requestId: string): Promise<{ id: string }> {
    let response = await this.axios.post(`/requests/${requestId}/retry`);
    return response.data;
  }

  // ---- Issues ----

  async listIssues(params?: PaginationParams & {
    type?: string;
    status?: string;
  }): Promise<PaginatedResponse<HookdeckIssue>> {
    let response = await this.axios.get('/issues', { params });
    return response.data;
  }

  async getIssue(issueId: string): Promise<HookdeckIssue> {
    let response = await this.axios.get(`/issues/${issueId}`);
    return response.data;
  }

  async updateIssue(issueId: string, data: { status: string }): Promise<HookdeckIssue> {
    let response = await this.axios.put(`/issues/${issueId}`, data);
    return response.data;
  }

  async dismissIssue(issueId: string): Promise<HookdeckIssue> {
    let response = await this.axios.put(`/issues/${issueId}/dismiss`);
    return response.data;
  }

  // ---- Issue Triggers ----

  async listIssueTriggers(params?: PaginationParams): Promise<PaginatedResponse<HookdeckIssueTrigger>> {
    let response = await this.axios.get('/issue-triggers', { params });
    return response.data;
  }

  async createIssueTrigger(data: {
    type: string;
    configs?: Record<string, unknown>;
  }): Promise<HookdeckIssueTrigger> {
    let response = await this.axios.post('/issue-triggers', data);
    return response.data;
  }

  async updateIssueTrigger(triggerId: string, data: {
    configs?: Record<string, unknown>;
  }): Promise<HookdeckIssueTrigger> {
    let response = await this.axios.put(`/issue-triggers/${triggerId}`, data);
    return response.data;
  }

  async deleteIssueTrigger(triggerId: string): Promise<{ id: string }> {
    let response = await this.axios.delete(`/issue-triggers/${triggerId}`);
    return response.data;
  }

  // ---- Transformations ----

  async listTransformations(params?: PaginationParams & { name?: string }): Promise<PaginatedResponse<HookdeckTransformation>> {
    let response = await this.axios.get('/transformations', { params });
    return response.data;
  }

  async getTransformation(transformationId: string): Promise<HookdeckTransformation> {
    let response = await this.axios.get(`/transformations/${transformationId}`);
    return response.data;
  }

  async createTransformation(data: {
    name: string;
    code: string;
    env?: Record<string, string>;
  }): Promise<HookdeckTransformation> {
    let response = await this.axios.post('/transformations', data);
    return response.data;
  }

  async updateTransformation(transformationId: string, data: {
    name?: string;
    code?: string;
    env?: Record<string, string>;
  }): Promise<HookdeckTransformation> {
    let response = await this.axios.put(`/transformations/${transformationId}`, data);
    return response.data;
  }

  async deleteTransformation(transformationId: string): Promise<{ id: string }> {
    let response = await this.axios.delete(`/transformations/${transformationId}`);
    return response.data;
  }

  // ---- Bookmarks ----

  async listBookmarks(params?: PaginationParams): Promise<PaginatedResponse<HookdeckBookmark>> {
    let response = await this.axios.get('/bookmarks', { params });
    return response.data;
  }

  async getBookmark(bookmarkId: string): Promise<HookdeckBookmark> {
    let response = await this.axios.get(`/bookmarks/${bookmarkId}`);
    return response.data;
  }

  async createBookmark(data: {
    label: string;
    event_data_id: string;
    webhook_id: string;
  }): Promise<HookdeckBookmark> {
    let response = await this.axios.post('/bookmarks', data);
    return response.data;
  }

  async triggerBookmark(bookmarkId: string): Promise<HookdeckEvent> {
    let response = await this.axios.post(`/bookmarks/${bookmarkId}/trigger`);
    return response.data;
  }

  async deleteBookmark(bookmarkId: string): Promise<{ id: string }> {
    let response = await this.axios.delete(`/bookmarks/${bookmarkId}`);
    return response.data;
  }

  // ---- Notifications ----

  async getWebhookNotifications(): Promise<{
    enabled: boolean;
    source_id?: string | null;
    topics: string[];
  }> {
    let response = await this.axios.get('/notifications/webhooks');
    return response.data;
  }

  async updateWebhookNotifications(data: {
    enabled: boolean;
    source_id?: string;
    topics?: string[];
  }): Promise<{
    enabled: boolean;
    source_id?: string | null;
    topics: string[];
  }> {
    let response = await this.axios.put('/notifications/webhooks', data);
    return response.data;
  }

  // ---- Publish API ----

  async publishEvent(data: {
    source_id?: string;
    source_name?: string;
    headers?: Record<string, string>;
    body?: unknown;
  }): Promise<unknown> {
    let publishAxios = createAxios({
      baseURL: 'https://hkdk.events/v1',
      headers: {
        Authorization: this.axios.defaults.headers.common?.['Authorization'] as string,
        'Content-Type': 'application/json',
      },
    });
    let response = await publishAxios.post('/publish', data);
    return response.data;
  }

  // ---- Attempts ----

  async listAttempts(params?: PaginationParams & {
    event_id?: string;
  }): Promise<PaginatedResponse<Record<string, unknown>>> {
    let response = await this.axios.get('/attempts', { params });
    return response.data;
  }
}
