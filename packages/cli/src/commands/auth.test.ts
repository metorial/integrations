import { describe, expect, it } from 'vitest';
import { normalizeCallbackRedirectUriForIntegration } from './auth';

describe('normalizeCallbackRedirectUriForIntegration', () => {
  it('normalizes Notion loopback redirects to localhost', () => {
    expect(
      normalizeCallbackRedirectUriForIntegration('notion', 'http://127.0.0.1:45873/callback')
    ).toBe('http://localhost:45873/callback');
  });

  it('leaves unrelated integration redirects unchanged', () => {
    expect(
      normalizeCallbackRedirectUriForIntegration('attio', 'http://127.0.0.1:45873/callback')
    ).toBe('http://127.0.0.1:45873/callback');
  });
});
