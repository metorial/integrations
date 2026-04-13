import { createAxios } from 'slates';

export class AnalyticsDataClient {
  private axios;

  constructor(private config: { token: string; propertyId: string }) {
    this.axios = createAxios({
      baseURL: 'https://analyticsdata.googleapis.com/v1beta',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async runReport(params: {
    dateRanges: Array<{ startDate: string; endDate: string }>;
    dimensions?: Array<{ name: string }>;
    metrics: Array<{ name: string }>;
    dimensionFilter?: any;
    metricFilter?: any;
    orderBys?: Array<any>;
    limit?: number;
    offset?: number;
    keepEmptyRows?: boolean;
  }) {
    let response = await this.axios.post(`/properties/${this.config.propertyId}:runReport`, params);
    return response.data;
  }

  async runRealtimeReport(params: {
    dimensions?: Array<{ name: string }>;
    metrics: Array<{ name: string }>;
    dimensionFilter?: any;
    metricFilter?: any;
    limit?: number;
  }) {
    let response = await this.axios.post(`/properties/${this.config.propertyId}:runRealtimeReport`, params);
    return response.data;
  }

  async runFunnelReport(params: {
    dateRanges?: Array<{ startDate: string; endDate: string }>;
    funnel: {
      steps: Array<{
        name: string;
        filterExpression?: any;
        isOpenFunnel?: boolean;
        withinDurationFromPriorStep?: string;
      }>;
      isOpenFunnel?: boolean;
    };
    funnelBreakdown?: { breakdownDimension: { name: string } };
  }) {
    let response = await this.axios.post(`/properties/${this.config.propertyId}:runFunnelReport`, params);
    return response.data;
  }

  async getMetadata() {
    let response = await this.axios.get(`/properties/${this.config.propertyId}/metadata`);
    return response.data;
  }
}

export class AnalyticsAdminClient {
  private axios;

  constructor(private config: { token: string; propertyId: string }) {
    this.axios = createAxios({
      baseURL: 'https://analyticsadmin.googleapis.com/v1beta',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Account methods
  async listAccounts(params?: { pageSize?: number; pageToken?: string }) {
    let response = await this.axios.get('/accounts', { params });
    return response.data;
  }

  async getAccount(accountId: string) {
    let response = await this.axios.get(`/accounts/${accountId}`);
    return response.data;
  }

  // Property methods
  async listProperties(params: { filter: string; pageSize?: number; pageToken?: string }) {
    let response = await this.axios.get('/properties', { params });
    return response.data;
  }

  async getProperty() {
    let response = await this.axios.get(`/properties/${this.config.propertyId}`);
    return response.data;
  }

  async updateProperty(updateMask: string, body: any) {
    let response = await this.axios.patch(`/properties/${this.config.propertyId}`, body, {
      params: { updateMask },
    });
    return response.data;
  }

  // Data Stream methods
  async listDataStreams(params?: { pageSize?: number; pageToken?: string }) {
    let response = await this.axios.get(`/properties/${this.config.propertyId}/dataStreams`, { params });
    return response.data;
  }

  async getDataStream(dataStreamId: string) {
    let response = await this.axios.get(`/properties/${this.config.propertyId}/dataStreams/${dataStreamId}`);
    return response.data;
  }

  async createDataStream(body: any) {
    let response = await this.axios.post(`/properties/${this.config.propertyId}/dataStreams`, body);
    return response.data;
  }

  async updateDataStream(dataStreamId: string, updateMask: string, body: any) {
    let response = await this.axios.patch(`/properties/${this.config.propertyId}/dataStreams/${dataStreamId}`, body, {
      params: { updateMask },
    });
    return response.data;
  }

  async deleteDataStream(dataStreamId: string) {
    let response = await this.axios.delete(`/properties/${this.config.propertyId}/dataStreams/${dataStreamId}`);
    return response.data;
  }

  // Custom Dimension methods
  async listCustomDimensions(params?: { pageSize?: number; pageToken?: string }) {
    let response = await this.axios.get(`/properties/${this.config.propertyId}/customDimensions`, { params });
    return response.data;
  }

  async createCustomDimension(body: { parameterName: string; displayName: string; description?: string; scope: string }) {
    let response = await this.axios.post(`/properties/${this.config.propertyId}/customDimensions`, body);
    return response.data;
  }

  async updateCustomDimension(customDimensionId: string, updateMask: string, body: any) {
    let response = await this.axios.patch(`/properties/${this.config.propertyId}/customDimensions/${customDimensionId}`, body, {
      params: { updateMask },
    });
    return response.data;
  }

  async archiveCustomDimension(customDimensionId: string) {
    let response = await this.axios.post(`/properties/${this.config.propertyId}/customDimensions/${customDimensionId}:archive`, {});
    return response.data;
  }

  // Custom Metric methods
  async listCustomMetrics(params?: { pageSize?: number; pageToken?: string }) {
    let response = await this.axios.get(`/properties/${this.config.propertyId}/customMetrics`, { params });
    return response.data;
  }

  async createCustomMetric(body: { parameterName: string; displayName: string; description?: string; scope: string; measurementUnit: string }) {
    let response = await this.axios.post(`/properties/${this.config.propertyId}/customMetrics`, body);
    return response.data;
  }

  async updateCustomMetric(customMetricId: string, updateMask: string, body: any) {
    let response = await this.axios.patch(`/properties/${this.config.propertyId}/customMetrics/${customMetricId}`, body, {
      params: { updateMask },
    });
    return response.data;
  }

  async archiveCustomMetric(customMetricId: string) {
    let response = await this.axios.post(`/properties/${this.config.propertyId}/customMetrics/${customMetricId}:archive`, {});
    return response.data;
  }

  // Audience methods
  async listAudiences(params?: { pageSize?: number; pageToken?: string }) {
    let response = await this.axios.get(`/properties/${this.config.propertyId}/audiences`, { params });
    return response.data;
  }

  async createAudience(body: any) {
    let response = await this.axios.post(`/properties/${this.config.propertyId}/audiences`, body);
    return response.data;
  }

  async updateAudience(audienceId: string, updateMask: string, body: any) {
    let response = await this.axios.patch(`/properties/${this.config.propertyId}/audiences/${audienceId}`, body, {
      params: { updateMask },
    });
    return response.data;
  }

  async archiveAudience(audienceId: string) {
    let response = await this.axios.post(`/properties/${this.config.propertyId}/audiences/${audienceId}:archive`, {});
    return response.data;
  }

  // Key Events (Conversions) methods
  async listKeyEvents(params?: { pageSize?: number; pageToken?: string }) {
    let response = await this.axios.get(`/properties/${this.config.propertyId}/keyEvents`, { params });
    return response.data;
  }

  async createKeyEvent(body: { eventName: string; countingMethod?: string }) {
    let response = await this.axios.post(`/properties/${this.config.propertyId}/keyEvents`, body);
    return response.data;
  }

  async getKeyEvent(keyEventId: string) {
    let response = await this.axios.get(`/properties/${this.config.propertyId}/keyEvents/${keyEventId}`);
    return response.data;
  }

  async updateKeyEvent(keyEventId: string, updateMask: string, body: any) {
    let response = await this.axios.patch(`/properties/${this.config.propertyId}/keyEvents/${keyEventId}`, body, {
      params: { updateMask },
    });
    return response.data;
  }

  async deleteKeyEvent(keyEventId: string) {
    let response = await this.axios.delete(`/properties/${this.config.propertyId}/keyEvents/${keyEventId}`);
    return response.data;
  }

  // Measurement Protocol Secrets
  async listMeasurementProtocolSecrets(dataStreamId: string, params?: { pageSize?: number; pageToken?: string }) {
    let response = await this.axios.get(
      `/properties/${this.config.propertyId}/dataStreams/${dataStreamId}/measurementProtocolSecrets`,
      { params }
    );
    return response.data;
  }

  async createMeasurementProtocolSecret(dataStreamId: string, body: { displayName: string }) {
    let response = await this.axios.post(
      `/properties/${this.config.propertyId}/dataStreams/${dataStreamId}/measurementProtocolSecrets`,
      body
    );
    return response.data;
  }

  async deleteMeasurementProtocolSecret(dataStreamId: string, secretId: string) {
    let response = await this.axios.delete(
      `/properties/${this.config.propertyId}/dataStreams/${dataStreamId}/measurementProtocolSecrets/${secretId}`
    );
    return response.data;
  }

  // Data Access Report
  async runAccessReport(params: {
    dateRanges: Array<{ startDate: string; endDate: string }>;
    dimensions?: Array<{ dimensionName: string }>;
    metrics?: Array<{ metricName: string }>;
    limit?: number;
    offset?: number;
  }) {
    let response = await this.axios.post(`/properties/${this.config.propertyId}:runAccessReport`, params);
    return response.data;
  }

  // Change History
  async searchChangeHistoryEvents(params: {
    earliestChangeTime?: string;
    latestChangeTime?: string;
    resourceType?: string[];
    action?: string[];
    pageSize?: number;
    pageToken?: string;
  }) {
    let response = await this.axios.post(
      `/accounts/-:searchChangeHistoryEvents`,
      {
        property: `properties/${this.config.propertyId}`,
        ...params,
      }
    );
    return response.data;
  }
}

export class MeasurementProtocolClient {
  private axios;

  constructor(private config: { measurementId: string; apiSecret: string }) {
    this.axios = createAxios({
      baseURL: 'https://www.google-analytics.com',
    });
  }

  async sendEvents(params: {
    clientId: string;
    userId?: string;
    events: Array<{
      name: string;
      params?: Record<string, any>;
    }>;
    userProperties?: Record<string, { value: any }>;
    consent?: {
      adUserData?: string;
      adPersonalization?: string;
    };
  }) {
    let response = await this.axios.post('/mp/collect', params, {
      params: {
        measurement_id: this.config.measurementId,
        api_secret: this.config.apiSecret,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  async validateEvents(params: {
    clientId: string;
    userId?: string;
    events: Array<{
      name: string;
      params?: Record<string, any>;
    }>;
    userProperties?: Record<string, { value: any }>;
  }) {
    let response = await this.axios.post('/debug/mp/collect', params, {
      params: {
        measurement_id: this.config.measurementId,
        api_secret: this.config.apiSecret,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }
}
