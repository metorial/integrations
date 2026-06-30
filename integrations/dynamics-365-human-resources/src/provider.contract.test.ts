import { createLocalSlateTestClient, expectSlateContract } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { provider } from './index';

describe('dynamics-365-human-resources provider contract', () => {
  it('exposes the expected provider, tool, trigger, and auth surface', async () => {
    let client = createLocalSlateTestClient({ slate: provider });
    let contract = await expectSlateContract({
      client,
      provider: {
        id: 'dynamics-365-human-resources',
        name: 'Dynamics 365 Human Resources'
      },
      toolIds: [
        'list_workers',
        'get_worker',
        'list_employees',
        'get_employee',
        'list_positions',
        'get_position',
        'list_jobs',
        'get_job',
        'list_departments',
        'get_department',
        'list_leave_balances',
        'get_leave_balance',
        'list_leave_requests',
        'get_leave_request',
        'list_compensation_plans',
        'get_compensation_plan',
        'list_benefit_enrollments',
        'get_benefit_enrollment'
      ],
      triggerIds: [],
      authMethodIds: ['oauth_organizations', 'client_credentials'],
      tools: [
        { id: 'list_workers', readOnly: true, destructive: false },
        { id: 'get_worker', readOnly: true, destructive: false },
        { id: 'list_employees', readOnly: true, destructive: false },
        { id: 'get_employee', readOnly: true, destructive: false },
        { id: 'list_positions', readOnly: true, destructive: false },
        { id: 'get_position', readOnly: true, destructive: false },
        { id: 'list_jobs', readOnly: true, destructive: false },
        { id: 'get_job', readOnly: true, destructive: false },
        { id: 'list_departments', readOnly: true, destructive: false },
        { id: 'get_department', readOnly: true, destructive: false },
        { id: 'list_leave_balances', readOnly: true, destructive: false },
        { id: 'get_leave_balance', readOnly: true, destructive: false },
        { id: 'list_leave_requests', readOnly: true, destructive: false },
        { id: 'get_leave_request', readOnly: true, destructive: false },
        { id: 'list_compensation_plans', readOnly: true, destructive: false },
        { id: 'get_compensation_plan', readOnly: true, destructive: false },
        { id: 'list_benefit_enrollments', readOnly: true, destructive: false },
        { id: 'get_benefit_enrollment', readOnly: true, destructive: false }
      ],
      triggers: []
    });

    expect(contract.actions).toHaveLength(18);
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
