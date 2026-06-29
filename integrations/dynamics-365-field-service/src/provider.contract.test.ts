import {
  createLocalSlateTestClient,
  describeMcpCompatibleToolSchemas,
  expectSlateContract
} from '@slates/test';
import { describe, expect, it } from 'vitest';
import { provider } from './index';

describe('dynamics-365-field-service provider contract', () => {
  it('exposes the expected provider, tool, and auth surface', async () => {
    let client = createLocalSlateTestClient({ slate: provider });
    let contract = await expectSlateContract({
      client,
      provider: {
        id: 'dynamics-365-field-service',
        name: 'Dynamics 365 Field Service'
      },
      toolIds: [
        'list_field_service_records',
        'get_field_service_record',
        'create_field_service_record',
        'update_field_service_record',
        'schedule_booking',
        'update_booking',
        'manage_work_order_lifecycle'
      ],
      triggerIds: [],
      authMethodIds: ['oauth_organizations', 'client_credentials'],
      tools: [
        { id: 'list_field_service_records', readOnly: true, destructive: false },
        { id: 'get_field_service_record', readOnly: true, destructive: false },
        { id: 'create_field_service_record', readOnly: false, destructive: false },
        { id: 'update_field_service_record', readOnly: false, destructive: false },
        { id: 'schedule_booking', readOnly: false, destructive: false },
        { id: 'update_booking', readOnly: false, destructive: false },
        { id: 'manage_work_order_lifecycle', readOnly: false, destructive: false }
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
  'Dynamics 365 Field Service tool input schemas',
  provider.actions
);
