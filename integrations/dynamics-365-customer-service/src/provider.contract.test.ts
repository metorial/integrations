import {
  createLocalSlateTestClient,
  describeMcpCompatibleToolSchemas,
  expectSlateContract
} from '@slates/test';
import { describe, expect, it } from 'vitest';
import { provider } from './index';

describe('dynamics-365-customer-service provider contract', () => {
  it('exposes the expected provider, tool, and auth surface', async () => {
    let client = createLocalSlateTestClient({ slate: provider });
    let contract = await expectSlateContract({
      client,
      provider: {
        id: 'dynamics-365-customer-service',
        name: 'Dynamics 365 Customer Service'
      },
      toolIds: [
        'list_customer_service_records',
        'get_customer_service_record',
        'create_customer_service_record',
        'update_customer_service_record',
        'manage_case_workflow',
        'download_note_attachment'
      ],
      triggerIds: [],
      authMethodIds: ['oauth_organizations', 'client_credentials'],
      tools: [
        { id: 'list_customer_service_records', readOnly: true, destructive: false },
        { id: 'get_customer_service_record', readOnly: true, destructive: false },
        { id: 'create_customer_service_record', readOnly: false, destructive: false },
        { id: 'update_customer_service_record', readOnly: false, destructive: false },
        { id: 'manage_case_workflow', readOnly: false, destructive: false },
        { id: 'download_note_attachment', readOnly: true, destructive: false }
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
  'Dynamics 365 Customer Service tool input schemas',
  provider.actions
);
