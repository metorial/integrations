import { describe, expect, it } from 'vitest';
import { auth } from './auth';

describe('Metorial Admin OAuth', () => {
  let getOauth = () => {
    let oauth = auth.authStack.find(method => method.key === 'oauth') as
      | { getAuthorizationUrl: (ctx: any) => Promise<any> }
      | undefined;
    expect(oauth).toBeDefined();
    return oauth!;
  };

  it('uses S256 PKCE for authorization URLs', async () => {
    let result = await getOauth().getAuthorizationUrl({
      redirectUri: 'http://localhost:1234/callback',
      state: 'state-123',
      input: {},
      clientId: 'client-123',
      clientSecret: 'secret-123',
      scopes: ['openid', 'profile', 'organization.instance:read']
    });
    let url = new URL(result.url);

    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(result.callbackState?.codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('lets OAuth apiUrl input override config and persists the resolved apiUrl', async () => {
    let result = await getOauth().getAuthorizationUrl({
      redirectUri: 'http://localhost:1234/callback',
      state: 'state-123',
      input: { apiUrl: 'https://oauth.example.test/' },
      config: { apiUrl: 'https://config.example.test/' },
      clientId: 'client-123',
      clientSecret: 'secret-123',
      scopes: ['openid']
    });
    let url = new URL(result.url);

    expect(url.origin).toBe('https://oauth.example.test');
    expect(result.callbackState?.apiUrl).toBe('https://oauth.example.test');
  });
});
