import { createLocalSlateTestClient, expectSlateContract } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { provider } from './index';

describe('dynamics-365-finance provider contract', () => {
  it('exposes the expected provider, tool, trigger, and auth surface', async () => {
    let client = createLocalSlateTestClient({ slate: provider });
    let contract = await expectSlateContract({
      client,
      provider: {
        id: 'dynamics-365-finance',
        name: 'Dynamics 365 Finance'
      },
      toolIds: [
        'list_legal_entities',
        'list_chart_of_accounts',
        'list_ledger_entries',
        'list_journals',
        'create_journal_draft_record',
        'list_customers',
        'get_customer',
        'list_vendors',
        'get_vendor',
        'list_vendor_invoices',
        'run_data_management_package_operation'
      ],
      triggerIds: [],
      authMethodIds: ['oauth_organizations', 'client_credentials'],
      tools: [
        { id: 'list_legal_entities', readOnly: true, destructive: false },
        { id: 'list_chart_of_accounts', readOnly: true, destructive: false },
        { id: 'list_ledger_entries', readOnly: true, destructive: false },
        { id: 'list_journals', readOnly: true, destructive: false },
        { id: 'create_journal_draft_record', readOnly: false, destructive: false },
        { id: 'list_customers', readOnly: true, destructive: false },
        { id: 'get_customer', readOnly: true, destructive: false },
        { id: 'list_vendors', readOnly: true, destructive: false },
        { id: 'get_vendor', readOnly: true, destructive: false },
        { id: 'list_vendor_invoices', readOnly: true, destructive: false },
        {
          id: 'run_data_management_package_operation',
          readOnly: false,
          destructive: false
        }
      ],
      triggers: []
    });

    expect(contract.actions).toHaveLength(11);
    expect(Object.keys(contract.configSchema.properties ?? {})).toEqual([
      'baseUrl',
      'environmentUrl',
      'defaultLegalEntity',
      'defaultPageSize',
      'defaultMaxPages'
    ]);

    let oauth = await client.getAuthMethod('oauth_organizations');
    expect(oauth.authenticationMethod.type).toBe('auth.oauth');
    expect(Object.keys(oauth.authenticationMethod.inputSchema.properties ?? {})).not.toContain(
      'tenantId'
    );
    expect(oauth.authenticationMethod.capabilities.handleTokenRefresh?.enabled).toBe(true);
    expect(oauth.authenticationMethod.capabilities.getProfile?.enabled).toBe(true);

    let clientCredentials = await client.getAuthMethod('client_credentials');
    expect(clientCredentials.authenticationMethod.type).toBe('auth.custom');
  });
});
