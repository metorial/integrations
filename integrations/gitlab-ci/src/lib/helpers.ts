import { Client } from './client';

export let createClient = (auth: { token: string; host?: string }, config: { host?: string }) => {
  return new Client({
    token: auth.token,
    host: auth.host || config.host || 'https://gitlab.com'
  });
};

export let resolveProjectId = (inputProjectId: string | undefined, configProjectId: string | undefined): string => {
  let projectId = inputProjectId || configProjectId;
  if (!projectId) {
    throw new Error('Project ID is required. Provide it as input or set a default in config.');
  }
  return projectId;
};
