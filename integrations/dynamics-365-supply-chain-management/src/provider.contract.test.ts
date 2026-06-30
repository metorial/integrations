import { createLocalSlateTestClient, expectSlateContract } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { provider } from './index';

describe('dynamics-365-supply-chain-management provider contract', () => {
  it('exposes the expected provider, tool, trigger, and auth surface', async () => {
    let client = createLocalSlateTestClient({ slate: provider });
    let contract = await expectSlateContract({
      client,
      provider: {
        id: 'dynamics-365-supply-chain-management',
        name: 'Dynamics 365 Supply Chain Management'
      },
      toolIds: [
        'list_products',
        'list_released_products',
        'get_released_product',
        'list_inventory_on_hand',
        'list_warehouses',
        'list_purchase_orders',
        'list_purchase_order_lines',
        'get_purchase_order',
        'list_sales_orders',
        'list_sales_order_lines',
        'get_sales_order',
        'list_shipments',
        'list_receipts'
      ],
      triggerIds: [],
      authMethodIds: ['oauth_organizations', 'client_credentials'],
      tools: [
        { id: 'list_products', readOnly: true, destructive: false },
        { id: 'list_released_products', readOnly: true, destructive: false },
        { id: 'get_released_product', readOnly: true, destructive: false },
        { id: 'list_inventory_on_hand', readOnly: true, destructive: false },
        { id: 'list_warehouses', readOnly: true, destructive: false },
        { id: 'list_purchase_orders', readOnly: true, destructive: false },
        { id: 'list_purchase_order_lines', readOnly: true, destructive: false },
        { id: 'get_purchase_order', readOnly: true, destructive: false },
        { id: 'list_sales_orders', readOnly: true, destructive: false },
        { id: 'list_sales_order_lines', readOnly: true, destructive: false },
        { id: 'get_sales_order', readOnly: true, destructive: false },
        { id: 'list_shipments', readOnly: true, destructive: false },
        { id: 'list_receipts', readOnly: true, destructive: false }
      ],
      triggers: []
    });

    expect(contract.actions).toHaveLength(13);
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
