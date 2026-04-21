export let MICROSOFT_OAUTH_INTEGRATION_KEYS = new Set([
  'azure-blob-storage',
  'azure-devops',
  'azure-functions',
  'azure-repos',
  'dynamics-365',
  'excel-online',
  'microsoft-teams',
  'onedrive',
  'onenote',
  'outlook',
  'power-bi',
  'powerpoint-online',
  'sharepoint',
  'superhuman-microsoft365',
  'word-online'
]);

export let usesMicrosoftOAuth = (integration: string) =>
  MICROSOFT_OAUTH_INTEGRATION_KEYS.has(integration);

export let normalizeMicrosoftRedirectUri = (redirectUri: string) => {
  let url = new URL(redirectUri);
  if (url.protocol === 'http:' && url.hostname === '127.0.0.1') {
    url.hostname = 'localhost';
  }

  return url.toString();
};

export let normalizeMicrosoftRedirectUriForIntegration = (
  integration: string,
  redirectUri: string
) => (usesMicrosoftOAuth(integration) ? normalizeMicrosoftRedirectUri(redirectUri) : redirectUri);
