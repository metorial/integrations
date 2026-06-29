import { createLocalSlateTestClient, expectSlateContract } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { provider } from './index';

describe('dynamics-365-commerce provider contract', () => {
  it('exposes the expected provider, tool, auth, and config surface', async () => {
    let client = createLocalSlateTestClient({ slate: provider });
    let contract = await expectSlateContract({
      client,
      provider: {
        id: 'dynamics-365-commerce',
        name: 'Dynamics 365 Commerce'
      },
      toolIds: [
        'lookup_channels_stores',
        'lookup_catalogs',
        'lookup_products_prices_inventory',
        'manage_customers',
        'manage_carts',
        'manage_orders',
        'download_retail_server_metadata'
      ],
      triggerIds: [],
      authMethodIds: ['client_credentials', 'access_token'],
      tools: [
        { id: 'lookup_channels_stores', readOnly: true, destructive: false },
        { id: 'lookup_catalogs', readOnly: true, destructive: false },
        { id: 'lookup_products_prices_inventory', readOnly: true, destructive: false },
        { id: 'manage_customers', readOnly: false, destructive: false },
        { id: 'manage_carts', readOnly: false, destructive: true },
        { id: 'manage_orders', readOnly: false, destructive: true },
        { id: 'download_retail_server_metadata', readOnly: true, destructive: false }
      ],
      triggers: []
    });

    expect(contract.actions).toHaveLength(7);
    expect(Object.keys(contract.configSchema.properties ?? {}).sort()).toEqual([
      'catalogId',
      'channelId',
      'defaultPageSize',
      'locale',
      'maxPageSize',
      'operatingUnitNumber',
      'retailServerUrl'
    ]);
    expect(contract.configSchema.required ?? []).toEqual([]);

    let clientCredentials = await client.getAuthMethod('client_credentials');
    expect(clientCredentials.authenticationMethod.type).toBe('auth.custom');
    expect(
      clientCredentials.authenticationMethod.capabilities.handleTokenRefresh?.enabled
    ).toBe(true);
    expect(clientCredentials.authenticationMethod.capabilities.getProfile?.enabled).toBe(true);

    let accessToken = await client.getAuthMethod('access_token');
    expect(accessToken.authenticationMethod.type).toBe('auth.token');
    expect(accessToken.authenticationMethod.capabilities.getProfile?.enabled).toBe(true);
  });
});
