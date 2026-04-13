import { createAxios } from 'slates';
import { signRequest, type AwsCredentials } from './aws-signer';

export interface LambdaClientConfig {
  region: string;
  credentials: AwsCredentials;
}

export class LambdaClient {
  private baseUrl: string;
  private region: string;
  private credentials: AwsCredentials;

  constructor(config: LambdaClientConfig) {
    this.region = config.region;
    this.credentials = config.credentials;
    this.baseUrl = `https://lambda.${config.region}.amazonaws.com`;
  }

  private async request<T = any>(
    method: string,
    path: string,
    options?: {
      body?: any;
      queryParams?: Record<string, string>;
      extraHeaders?: Record<string, string>;
    }
  ): Promise<T> {
    let url = `${this.baseUrl}${path}`;
    if (options?.queryParams) {
      let params = new URLSearchParams();
      for (let [key, value] of Object.entries(options.queryParams)) {
        if (value !== undefined && value !== '') {
          params.set(key, value);
        }
      }
      let qs = params.toString();
      if (qs) {
        url += `?${qs}`;
      }
    }

    let body = options?.body ? JSON.stringify(options.body) : undefined;

    let headers: Record<string, string> = {
      'content-type': 'application/json',
      ...(options?.extraHeaders || {})
    };

    let sigHeaders = signRequest({
      method,
      url,
      headers,
      body,
      region: this.region,
      service: 'lambda',
      credentials: this.credentials
    });

    let allHeaders = { ...headers, ...sigHeaders };

    let ax = createAxios({ baseURL: this.baseUrl });

    let response = await ax.request({
      method,
      url,
      headers: allHeaders,
      data: body,
      validateStatus: () => true
    });

    if (response.status >= 400) {
      let errMsg = typeof response.data === 'object' && response.data?.Message
        ? response.data.Message
        : typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data);
      throw new Error(`AWS Lambda API error (${response.status}): ${errMsg}`);
    }

    return response.data as T;
  }

  // ---- Function Management ----

  async createFunction(params: Record<string, any>): Promise<any> {
    return this.request('POST', '/2015-03-31/functions', { body: params });
  }

  async getFunction(functionName: string, qualifier?: string): Promise<any> {
    let qp: Record<string, string> = {};
    if (qualifier) qp['Qualifier'] = qualifier;
    return this.request('GET', `/2015-03-31/functions/${encodeURIComponent(functionName)}`, { queryParams: qp });
  }

  async getFunctionConfiguration(functionName: string, qualifier?: string): Promise<any> {
    let qp: Record<string, string> = {};
    if (qualifier) qp['Qualifier'] = qualifier;
    return this.request('GET', `/2015-03-31/functions/${encodeURIComponent(functionName)}/configuration`, { queryParams: qp });
  }

  async updateFunctionCode(functionName: string, params: Record<string, any>): Promise<any> {
    return this.request('PUT', `/2015-03-31/functions/${encodeURIComponent(functionName)}/code`, { body: params });
  }

  async updateFunctionConfiguration(functionName: string, params: Record<string, any>): Promise<any> {
    return this.request('PUT', `/2015-03-31/functions/${encodeURIComponent(functionName)}/configuration`, { body: params });
  }

  async deleteFunction(functionName: string, qualifier?: string): Promise<void> {
    let qp: Record<string, string> = {};
    if (qualifier) qp['Qualifier'] = qualifier;
    await this.request('DELETE', `/2015-03-31/functions/${encodeURIComponent(functionName)}`, { queryParams: qp });
  }

  async listFunctions(marker?: string, maxItems?: number, functionVersion?: string): Promise<any> {
    let qp: Record<string, string> = {};
    if (marker) qp['Marker'] = marker;
    if (maxItems) qp['MaxItems'] = String(maxItems);
    if (functionVersion) qp['FunctionVersion'] = functionVersion;
    return this.request('GET', '/2015-03-31/functions', { queryParams: qp });
  }

  // ---- Invocation ----

  async invokeFunction(
    functionName: string,
    payload?: any,
    options?: {
      invocationType?: string;
      logType?: string;
      qualifier?: string;
      clientContext?: string;
    }
  ): Promise<any> {
    let qp: Record<string, string> = {};
    if (options?.qualifier) qp['Qualifier'] = options.qualifier;

    let extraHeaders: Record<string, string> = {};
    if (options?.invocationType) extraHeaders['X-Amz-Invocation-Type'] = options.invocationType;
    if (options?.logType) extraHeaders['X-Amz-Log-Type'] = options.logType;
    if (options?.clientContext) extraHeaders['X-Amz-Client-Context'] = options.clientContext;

    return this.request('POST', `/2015-03-31/functions/${encodeURIComponent(functionName)}/invocations`, {
      body: payload,
      queryParams: qp,
      extraHeaders
    });
  }

  // ---- Versions ----

  async publishVersion(functionName: string, params?: Record<string, any>): Promise<any> {
    return this.request('POST', `/2015-03-31/functions/${encodeURIComponent(functionName)}/versions`, {
      body: params || {}
    });
  }

  async listVersionsByFunction(functionName: string, marker?: string, maxItems?: number): Promise<any> {
    let qp: Record<string, string> = {};
    if (marker) qp['Marker'] = marker;
    if (maxItems) qp['MaxItems'] = String(maxItems);
    return this.request('GET', `/2015-03-31/functions/${encodeURIComponent(functionName)}/versions`, { queryParams: qp });
  }

  // ---- Aliases ----

  async createAlias(functionName: string, params: Record<string, any>): Promise<any> {
    return this.request('POST', `/2015-03-31/functions/${encodeURIComponent(functionName)}/aliases`, { body: params });
  }

  async getAlias(functionName: string, aliasName: string): Promise<any> {
    return this.request('GET', `/2015-03-31/functions/${encodeURIComponent(functionName)}/aliases/${encodeURIComponent(aliasName)}`);
  }

  async updateAlias(functionName: string, aliasName: string, params: Record<string, any>): Promise<any> {
    return this.request('PUT', `/2015-03-31/functions/${encodeURIComponent(functionName)}/aliases/${encodeURIComponent(aliasName)}`, { body: params });
  }

  async deleteAlias(functionName: string, aliasName: string): Promise<void> {
    await this.request('DELETE', `/2015-03-31/functions/${encodeURIComponent(functionName)}/aliases/${encodeURIComponent(aliasName)}`);
  }

  async listAliases(functionName: string, marker?: string, maxItems?: number): Promise<any> {
    let qp: Record<string, string> = {};
    if (marker) qp['Marker'] = marker;
    if (maxItems) qp['MaxItems'] = String(maxItems);
    return this.request('GET', `/2015-03-31/functions/${encodeURIComponent(functionName)}/aliases`, { queryParams: qp });
  }

  // ---- Layers ----

  async publishLayerVersion(layerName: string, params: Record<string, any>): Promise<any> {
    return this.request('POST', `/2018-10-31/layers/${encodeURIComponent(layerName)}/versions`, { body: params });
  }

  async getLayerVersion(layerName: string, versionNumber: number): Promise<any> {
    return this.request('GET', `/2018-10-31/layers/${encodeURIComponent(layerName)}/versions/${versionNumber}`);
  }

  async deleteLayerVersion(layerName: string, versionNumber: number): Promise<void> {
    await this.request('DELETE', `/2018-10-31/layers/${encodeURIComponent(layerName)}/versions/${versionNumber}`);
  }

  async listLayers(marker?: string, maxItems?: number, compatibleRuntime?: string): Promise<any> {
    let qp: Record<string, string> = {};
    if (marker) qp['Marker'] = marker;
    if (maxItems) qp['MaxItems'] = String(maxItems);
    if (compatibleRuntime) qp['CompatibleRuntime'] = compatibleRuntime;
    return this.request('GET', '/2018-10-31/layers', { queryParams: qp });
  }

  async listLayerVersions(layerName: string, marker?: string, maxItems?: number): Promise<any> {
    let qp: Record<string, string> = {};
    if (marker) qp['Marker'] = marker;
    if (maxItems) qp['MaxItems'] = String(maxItems);
    return this.request('GET', `/2018-10-31/layers/${encodeURIComponent(layerName)}/versions`, { queryParams: qp });
  }

  // ---- Event Source Mappings ----

  async createEventSourceMapping(params: Record<string, any>): Promise<any> {
    return this.request('POST', '/2015-03-31/event-source-mappings', { body: params });
  }

  async getEventSourceMapping(uuid: string): Promise<any> {
    return this.request('GET', `/2015-03-31/event-source-mappings/${encodeURIComponent(uuid)}`);
  }

  async updateEventSourceMapping(uuid: string, params: Record<string, any>): Promise<any> {
    return this.request('PUT', `/2015-03-31/event-source-mappings/${encodeURIComponent(uuid)}`, { body: params });
  }

  async deleteEventSourceMapping(uuid: string): Promise<any> {
    return this.request('DELETE', `/2015-03-31/event-source-mappings/${encodeURIComponent(uuid)}`);
  }

  async listEventSourceMappings(functionName?: string, eventSourceArn?: string, marker?: string, maxItems?: number): Promise<any> {
    let qp: Record<string, string> = {};
    if (functionName) qp['FunctionName'] = functionName;
    if (eventSourceArn) qp['EventSourceArn'] = eventSourceArn;
    if (marker) qp['Marker'] = marker;
    if (maxItems) qp['MaxItems'] = String(maxItems);
    return this.request('GET', '/2015-03-31/event-source-mappings', { queryParams: qp });
  }

  // ---- Function URLs ----

  async createFunctionUrlConfig(functionName: string, params: Record<string, any>, qualifier?: string): Promise<any> {
    let qp: Record<string, string> = {};
    if (qualifier) qp['Qualifier'] = qualifier;
    return this.request('POST', `/2021-10-31/functions/${encodeURIComponent(functionName)}/url`, { body: params, queryParams: qp });
  }

  async getFunctionUrlConfig(functionName: string, qualifier?: string): Promise<any> {
    let qp: Record<string, string> = {};
    if (qualifier) qp['Qualifier'] = qualifier;
    return this.request('GET', `/2021-10-31/functions/${encodeURIComponent(functionName)}/url`, { queryParams: qp });
  }

  async updateFunctionUrlConfig(functionName: string, params: Record<string, any>, qualifier?: string): Promise<any> {
    let qp: Record<string, string> = {};
    if (qualifier) qp['Qualifier'] = qualifier;
    return this.request('PUT', `/2021-10-31/functions/${encodeURIComponent(functionName)}/url`, { body: params, queryParams: qp });
  }

  async deleteFunctionUrlConfig(functionName: string, qualifier?: string): Promise<void> {
    let qp: Record<string, string> = {};
    if (qualifier) qp['Qualifier'] = qualifier;
    await this.request('DELETE', `/2021-10-31/functions/${encodeURIComponent(functionName)}/url`, { queryParams: qp });
  }

  // ---- Concurrency ----

  async putFunctionConcurrency(functionName: string, reservedConcurrentExecutions: number): Promise<any> {
    return this.request('PUT', `/2017-10-31/functions/${encodeURIComponent(functionName)}/concurrency`, {
      body: { ReservedConcurrentExecutions: reservedConcurrentExecutions }
    });
  }

  async getFunctionConcurrency(functionName: string): Promise<any> {
    return this.request('GET', `/2019-09-30/functions/${encodeURIComponent(functionName)}/concurrency`);
  }

  async deleteFunctionConcurrency(functionName: string): Promise<void> {
    await this.request('DELETE', `/2017-10-31/functions/${encodeURIComponent(functionName)}/concurrency`);
  }

  async putProvisionedConcurrencyConfig(functionName: string, qualifier: string, provisionedConcurrentExecutions: number): Promise<any> {
    return this.request('PUT', `/2019-09-30/functions/${encodeURIComponent(functionName)}/provisioned-concurrency`, {
      queryParams: { Qualifier: qualifier },
      body: { ProvisionedConcurrentExecutions: provisionedConcurrentExecutions }
    });
  }

  async getProvisionedConcurrencyConfig(functionName: string, qualifier: string): Promise<any> {
    return this.request('GET', `/2019-09-30/functions/${encodeURIComponent(functionName)}/provisioned-concurrency`, {
      queryParams: { Qualifier: qualifier }
    });
  }

  async deleteProvisionedConcurrencyConfig(functionName: string, qualifier: string): Promise<void> {
    await this.request('DELETE', `/2021-10-31/functions/${encodeURIComponent(functionName)}/provisioned-concurrency`, {
      queryParams: { Qualifier: qualifier }
    });
  }

  // ---- Permissions ----

  async addPermission(functionName: string, params: Record<string, any>, qualifier?: string): Promise<any> {
    let qp: Record<string, string> = {};
    if (qualifier) qp['Qualifier'] = qualifier;
    return this.request('POST', `/2015-03-31/functions/${encodeURIComponent(functionName)}/policy`, { body: params, queryParams: qp });
  }

  async removePermission(functionName: string, statementId: string, qualifier?: string, revisionId?: string): Promise<void> {
    let qp: Record<string, string> = {};
    if (qualifier) qp['Qualifier'] = qualifier;
    if (revisionId) qp['RevisionId'] = revisionId;
    await this.request('DELETE', `/2015-03-31/functions/${encodeURIComponent(functionName)}/policy/${encodeURIComponent(statementId)}`, { queryParams: qp });
  }

  async getPolicy(functionName: string, qualifier?: string): Promise<any> {
    let qp: Record<string, string> = {};
    if (qualifier) qp['Qualifier'] = qualifier;
    return this.request('GET', `/2015-03-31/functions/${encodeURIComponent(functionName)}/policy`, { queryParams: qp });
  }

  // ---- Tags ----

  async tagResource(arn: string, tags: Record<string, string>): Promise<void> {
    await this.request('POST', `/2017-03-31/tags/${encodeURIComponent(arn)}`, {
      body: { Tags: tags }
    });
  }

  async untagResource(arn: string, tagKeys: string[]): Promise<void> {
    let qp: Record<string, string> = {};
    // Tag keys are passed as repeated query params
    // Using comma separation as URLSearchParams doesn't support repeated keys well
    await this.request('DELETE', `/2017-03-31/tags/${encodeURIComponent(arn)}`, {
      queryParams: { tagKeys: tagKeys.join(',') }
    });
  }

  async listTags(arn: string): Promise<any> {
    return this.request('GET', `/2017-03-31/tags/${encodeURIComponent(arn)}`);
  }

  // ---- Async Invocation Configuration ----

  async putFunctionEventInvokeConfig(functionName: string, params: Record<string, any>, qualifier?: string): Promise<any> {
    let qp: Record<string, string> = {};
    if (qualifier) qp['Qualifier'] = qualifier;
    return this.request('PUT', `/2019-09-25/functions/${encodeURIComponent(functionName)}/event-invoke-config`, { body: params, queryParams: qp });
  }

  async getFunctionEventInvokeConfig(functionName: string, qualifier?: string): Promise<any> {
    let qp: Record<string, string> = {};
    if (qualifier) qp['Qualifier'] = qualifier;
    return this.request('GET', `/2019-09-25/functions/${encodeURIComponent(functionName)}/event-invoke-config`, { queryParams: qp });
  }

  async deleteFunctionEventInvokeConfig(functionName: string, qualifier?: string): Promise<void> {
    let qp: Record<string, string> = {};
    if (qualifier) qp['Qualifier'] = qualifier;
    await this.request('DELETE', `/2019-09-25/functions/${encodeURIComponent(functionName)}/event-invoke-config`, { queryParams: qp });
  }

  // ---- Durable Executions ----

  async getDurableExecution(durableExecutionArn: string): Promise<any> {
    return this.request('GET', `/2025-12-01/durable-executions/${encodeURIComponent(durableExecutionArn)}`);
  }

  async getDurableExecutionHistory(durableExecutionArn: string, marker?: string, maxItems?: number): Promise<any> {
    let qp: Record<string, string> = {};
    if (marker) qp['Marker'] = marker;
    if (maxItems) qp['MaxItems'] = String(maxItems);
    return this.request('GET', `/2025-12-01/durable-executions/${encodeURIComponent(durableExecutionArn)}/history`, { queryParams: qp });
  }

  async getDurableExecutionState(durableExecutionArn: string): Promise<any> {
    return this.request('GET', `/2025-12-01/durable-executions/${encodeURIComponent(durableExecutionArn)}/state`);
  }

  async listDurableExecutionsByFunction(functionName: string, statuses?: string, marker?: string, maxItems?: number): Promise<any> {
    let qp: Record<string, string> = {};
    if (statuses) qp['Statuses'] = statuses;
    if (marker) qp['Marker'] = marker;
    if (maxItems) qp['MaxItems'] = String(maxItems);
    return this.request('GET', `/2025-12-01/functions/${encodeURIComponent(functionName)}/durable-executions`, { queryParams: qp });
  }

  async stopDurableExecution(durableExecutionArn: string, params?: Record<string, any>): Promise<any> {
    return this.request('POST', `/2025-12-01/durable-executions/${encodeURIComponent(durableExecutionArn)}/stop`, { body: params || {} });
  }

  async sendDurableExecutionCallbackSuccess(callbackId: string, result?: any): Promise<any> {
    return this.request('POST', `/2025-12-01/durable-execution-callbacks/${encodeURIComponent(callbackId)}/succeed`, { body: result || {} });
  }

  async sendDurableExecutionCallbackFailure(callbackId: string, params?: Record<string, any>): Promise<any> {
    return this.request('POST', `/2025-12-01/durable-execution-callbacks/${encodeURIComponent(callbackId)}/fail`, { body: params || {} });
  }

  async sendDurableExecutionCallbackHeartbeat(callbackId: string): Promise<any> {
    return this.request('POST', `/2025-12-01/durable-execution-callbacks/${encodeURIComponent(callbackId)}/heartbeat`, { body: {} });
  }

  // ---- Account Settings ----

  async getAccountSettings(): Promise<any> {
    return this.request('GET', '/2015-03-31/account-settings');
  }
}
