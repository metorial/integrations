import { describe, expect, it } from 'vitest';
import {
  normalizeMicrosoftRedirectUri,
  normalizeMicrosoftRedirectUriForIntegration,
  usesMicrosoftOAuth
} from './index';

describe('@slates/oauth-microsoft', () => {
  it('normalizes loopback IPv4 redirect URIs to localhost', () => {
    expect(normalizeMicrosoftRedirectUri('http://127.0.0.1:45873/callback')).toBe(
      'http://localhost:45873/callback'
    );
  });

  it('leaves non-loopback redirect URIs unchanged', () => {
    expect(normalizeMicrosoftRedirectUri('https://example.com/callback')).toBe(
      'https://example.com/callback'
    );
  });

  it('detects Microsoft OAuth integrations', () => {
    expect(usesMicrosoftOAuth('sharepoint')).toBe(true);
    expect(usesMicrosoftOAuth('github')).toBe(false);
  });

  it('only normalizes redirect URIs for Microsoft OAuth integrations', () => {
    expect(
      normalizeMicrosoftRedirectUriForIntegration(
        'outlook',
        'http://127.0.0.1:45873/callback'
      )
    ).toBe('http://localhost:45873/callback');
    expect(
      normalizeMicrosoftRedirectUriForIntegration(
        'github',
        'http://127.0.0.1:45873/callback'
      )
    ).toBe('http://127.0.0.1:45873/callback');
  });
});
