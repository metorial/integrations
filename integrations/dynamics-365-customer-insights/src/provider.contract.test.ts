import {
  createLocalSlateTestClient,
  describeMcpCompatibleToolSchemas,
  expectSlateContract
} from '@slates/test';
import { describe, expect, it } from 'vitest';
import { provider } from './index';

describe('dynamics-365-customer-insights provider contract', () => {
  it('exposes the expected provider, tool, and auth surface', async () => {
    let client = createLocalSlateTestClient({ slate: provider });
    let contract = await expectSlateContract({
      client,
      provider: {
        id: 'dynamics-365-customer-insights',
        name: 'Dynamics 365 Customer Insights'
      },
      toolIds: [
        'list_customer_insights_records',
        'get_customer_insights_record',
        'export_segment_members'
      ],
      triggerIds: [],
      authMethodIds: ['oauth_organizations', 'client_credentials'],
      tools: [
        { id: 'list_customer_insights_records', readOnly: true, destructive: false },
        { id: 'get_customer_insights_record', readOnly: true, destructive: false },
        { id: 'export_segment_members', readOnly: true, destructive: false }
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

describeMcpCompatibleToolSchemas(
  'Dynamics 365 Customer Insights tool input schemas',
  provider.actions
);
