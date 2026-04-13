import { TableauClient } from './client';

export let createClient = (
  config: { serverUrl: string; apiVersion: string; siteContentUrl: string },
  auth: { token: string; siteId: string }
) => {
  return new TableauClient({
    serverUrl: config.serverUrl,
    apiVersion: config.apiVersion,
    siteId: auth.siteId,
    token: auth.token
  });
};
