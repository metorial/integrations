import {
  createLocalSlateTestClient,
  describeMcpCompatibleToolSchemas,
  expectSlateContract
} from '@slates/test';
import { describe, expect, it } from 'vitest';
import { provider } from './index';

describe('dynamics-365-sales provider contract', () => {
  it('exposes the expected provider, tool, and auth surface', async () => {
    let client = createLocalSlateTestClient({ slate: provider });
    let contract = await expectSlateContract({
      client,
      provider: {
        id: 'dynamics-365-sales',
        name: 'Dynamics 365 Sales'
      },
      toolIds: [
        'list_sales_records',
        'get_sales_record',
        'create_sales_record',
        'update_sales_record',
        'qualify_lead',
        'close_opportunity'
      ],
      triggerIds: [],
      authMethodIds: ['oauth_organizations', 'client_credentials'],
      tools: [
        { id: 'list_sales_records', readOnly: true, destructive: false },
        { id: 'get_sales_record', readOnly: true, destructive: false },
        { id: 'create_sales_record', readOnly: false, destructive: false },
        { id: 'update_sales_record', readOnly: false, destructive: false },
        { id: 'qualify_lead', readOnly: false, destructive: false },
        { id: 'close_opportunity', readOnly: false, destructive: false }
      ]
    });

    expect(Object.keys(contract.configSchema.properties ?? {})).toEqual([
      'instanceUrl',
      'apiVersion'
    ]);

    let oauth = await client.getAuthMethod('oauth_organizations');
    expect(oauth.authenticationMethod.type).toBe('auth.oauth');
    expect(Object.keys(oauth.authenticationMethod.inputSchema.properties ?? {})).not.toContain(
      'tenantId'
    );
    expect(oauth.authenticationMethod.capabilities.handleTokenRefresh?.enabled).toBe(true);
    expect(oauth.authenticationMethod.capabilities.getProfile?.enabled).toBe(true);
  });
});

describeMcpCompatibleToolSchemas('Dynamics 365 Sales tool input schemas', provider.actions);
