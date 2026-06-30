import { describe, expect, it } from 'vitest';
import { normalizeDiscoveredDataverseInstanceUrl } from './auth';

describe('Project Operations auth helpers', () => {
  it('prefers Dataverse discovery ApiUrl and strips the Web API path', () => {
    expect(
      normalizeDiscoveredDataverseInstanceUrl({
        ApiUrl: 'https://contoso.crm.dynamics.com/api/data/v9.2',
        Url: 'https://contoso.crm.dynamics.com/main.aspx?appid=app-id'
      })
    ).toBe('https://contoso.crm.dynamics.com');
  });

  it('falls back to discovery Url origin instead of retaining app UI paths', () => {
    expect(
      normalizeDiscoveredDataverseInstanceUrl({
        Url: 'https://contoso.crm.dynamics.com/main.aspx?appid=app-id'
      })
    ).toBe('https://contoso.crm.dynamics.com');
  });
});
