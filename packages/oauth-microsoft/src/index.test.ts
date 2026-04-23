import { describe, expect, it } from 'vitest';
import {
  buildMicrosoftGraphUploadBody,
  normalizeMicrosoftRedirectUri,
  normalizeMicrosoftRedirectUriForIntegration,
  resolveMicrosoftTenant,
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
      normalizeMicrosoftRedirectUriForIntegration('outlook', 'http://127.0.0.1:45873/callback')
    ).toBe('http://localhost:45873/callback');
    expect(
      normalizeMicrosoftRedirectUriForIntegration('github', 'http://127.0.0.1:45873/callback')
    ).toBe('http://127.0.0.1:45873/callback');
  });

  it('uses the default tenant when the input tenant is missing or blank', () => {
    expect(resolveMicrosoftTenant(undefined, 'common')).toBe('common');
    expect(resolveMicrosoftTenant('   ', 'organizations')).toBe('organizations');
  });

  it('uses a trimmed tenant override when provided', () => {
    expect(resolveMicrosoftTenant(' tenants/foo ', 'common')).toBe('tenants/foo');
  });

  it('decodes binary-looking base64 uploads for non-text files', () => {
    let body = buildMicrosoftGraphUploadBody(
      'report.docx',
      'SGVsbG8=',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    expect(Buffer.isBuffer(body)).toBe(true);
    expect(body.toString('utf8')).toBe('Hello');
  });

  it('preserves text uploads even when the content looks like base64', () => {
    let body = buildMicrosoftGraphUploadBody('notes.txt', 'SGVsbG8=', 'text/plain');

    expect(body).toBe('SGVsbG8=');
  });
});
