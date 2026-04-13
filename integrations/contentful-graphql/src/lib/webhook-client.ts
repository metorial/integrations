import { createAxios } from 'slates';
import type { AxiosInstance } from 'axios';

export interface WebhookClientConfig {
  managementToken: string;
  spaceId: string;
  region: 'us' | 'eu';
}

let getCmaBaseUrl = (region: 'us' | 'eu') =>
  region === 'eu' ? 'https://api.eu.contentful.com' : 'https://api.contentful.com';

export class ContentfulWebhookClient {
  private cma: AxiosInstance;
  private spaceId: string;

  constructor(config: WebhookClientConfig) {
    this.spaceId = config.spaceId;

    this.cma = createAxios({
      baseURL: getCmaBaseUrl(config.region),
      headers: {
        Authorization: `Bearer ${config.managementToken}`,
        'Content-Type': 'application/vnd.contentful.management.v1+json'
      }
    });
  }

  private spacePath(path: string = '') {
    return `/spaces/${this.spaceId}${path}`;
  }

  async createWebhook(data: {
    name: string;
    url: string;
    topics: string[];
    headers?: { key: string; value: string }[];
    filters?: any[];
    active?: boolean;
  }) {
    let response = await this.cma.post(this.spacePath('/webhook_definitions'), data);
    return response.data;
  }

  async deleteWebhook(webhookId: string) {
    await this.cma.delete(this.spacePath(`/webhook_definitions/${webhookId}`));
  }
}
