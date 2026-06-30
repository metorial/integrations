import { createLocalSlateTestClient } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { provider } from './index';

let expectedToolIds = [
  'manage_projects',
  'manage_project_tasks',
  'manage_resource_assignments',
  'manage_time_entries',
  'manage_expenses',
  'manage_project_contracts',
  'manage_project_actuals',
  'manage_project_invoices',
  'manage_project_schedule',
  'manage_finance_handoff'
];

let readOnlyToolIds = new Set([
  'manage_project_tasks',
  'manage_resource_assignments',
  'manage_project_contracts',
  'manage_project_actuals',
  'manage_project_invoices'
]);

let destructiveToolIds = new Set(['manage_project_schedule']);

describe('Dynamics 365 Project Operations provider contract', () => {
  it('registers the expected P0 product tool surface', () => {
    expect(provider.actions.map(action => action.key).sort()).toEqual(
      [...expectedToolIds].sort()
    );
    expect((provider as { triggers?: unknown[] }).triggers ?? []).toEqual([]);
  });

  it('marks read-only and destructive tools accurately', () => {
    for (let action of provider.actions) {
      let shouldBeReadOnly = readOnlyToolIds.has(action.key);

      expect(action.parameters.tags?.readOnly ?? false, `${action.key} readOnly`).toBe(
        shouldBeReadOnly
      );
      expect(action.parameters.tags?.destructive ?? false, `${action.key} destructive`).toBe(
        destructiveToolIds.has(action.key)
      );
    }
  });

  it('does not require tenantId for delegated Work Only OAuth setup', async () => {
    let client = createLocalSlateTestClient({ slate: provider });
    let oauth = await client.getAuthMethod('oauth_organizations');

    expect(oauth.authenticationMethod.type).toBe('auth.oauth');
    expect(Object.keys(oauth.authenticationMethod.inputSchema.properties ?? {})).not.toContain(
      'tenantId'
    );
  });
});
