import { createAxios } from 'slates';
import { signRequest, AwsCredentials } from './signing';

export interface AwsClientConfig {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  region: string;
}

export class AwsClient {
  private credentials: AwsCredentials;
  private region: string;

  constructor(config: AwsClientConfig) {
    this.credentials = {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      sessionToken: config.sessionToken,
    };
    this.region = config.region;
  }

  private getEndpoint(service: string, region?: string): string {
    let r = region ?? this.region;
    if (service === 's3') {
      return `https://s3.${r}.amazonaws.com`;
    }
    if (service === 'iam') {
      return 'https://iam.amazonaws.com';
    }
    if (service === 'sts') {
      return 'https://sts.amazonaws.com';
    }
    if (service === 'cloudfront') {
      return 'https://cloudfront.amazonaws.com';
    }
    return `https://${service}.${r}.amazonaws.com`;
  }

  async request(options: {
    service: string;
    method: string;
    path?: string;
    params?: Record<string, string>;
    body?: string;
    headers?: Record<string, string>;
    region?: string;
  }): Promise<any> {
    let ax = createAxios();
    let endpoint = this.getEndpoint(options.service, options.region);
    let url = `${endpoint}${options.path ?? '/'}`;
    let region = options.region ?? this.region;

    if (options.service === 'iam') {
      region = 'us-east-1';
    }

    let headers: Record<string, string> = {
      ...options.headers,
    };

    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    let signed = await signRequest({
      method: options.method,
      url,
      headers,
      params: options.params,
      body: options.body ?? '',
      credentials: this.credentials,
      region,
      service: options.service,
    });

    let response = await ax.request({
      method: options.method,
      url,
      headers: signed.headers,
      params: signed.params,
      data: options.body,
    });

    return response.data;
  }

  async queryApi(options: {
    service: string;
    action: string;
    params?: Record<string, string>;
    version?: string;
    region?: string;
  }): Promise<any> {
    let allParams: Record<string, string> = {
      Action: options.action,
      ...(options.version ? { Version: options.version } : {}),
      ...(options.params ?? {}),
    };

    return this.request({
      service: options.service,
      method: 'GET',
      params: allParams,
      region: options.region,
    });
  }

  async postQueryApi(options: {
    service: string;
    action: string;
    params?: Record<string, string>;
    version?: string;
    region?: string;
  }): Promise<any> {
    let allParams: Record<string, string> = {
      Action: options.action,
      ...(options.version ? { Version: options.version } : {}),
      ...(options.params ?? {}),
    };

    let body = Object.entries(allParams)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    return this.request({
      service: options.service,
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      region: options.region,
    });
  }

  async jsonApi(options: {
    service: string;
    target: string;
    payload: Record<string, any>;
    region?: string;
  }): Promise<any> {
    let body = JSON.stringify(options.payload);

    return this.request({
      service: options.service,
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/x-amz-json-1.0',
        'X-Amz-Target': options.target,
      },
      region: options.region,
    });
  }

  async jsonApi11(options: {
    service: string;
    target: string;
    payload: Record<string, any>;
    region?: string;
  }): Promise<any> {
    let body = JSON.stringify(options.payload);

    return this.request({
      service: options.service,
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': options.target,
      },
      region: options.region,
    });
  }
}

export let createAwsClient = (config: AwsClientConfig): AwsClient => {
  return new AwsClient(config);
};
