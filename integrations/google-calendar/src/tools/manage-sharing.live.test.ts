import { expectSlateError, expectToolCall } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { setupGoogleCalendarLiveHarness } from './test-helpers';

let { getHarness, skipIfMissingScopes } = setupGoogleCalendarLiveHarness();

describe.sequential('google-calendar manage_sharing', () => {
  it('lists, grants, updates, and revokes calendar sharing rules', async context => {
    skipIfMissingScopes(context);

    let harness = getHarness();
    let calendarId = 'primary';

    let listed = await expectToolCall({
      client: harness.client,
      toolId: 'manage_sharing',
      input: {
        action: 'list',
        calendarId
      }
    });
    expect(Array.isArray(listed.output.rules)).toBe(true);

    let granted = await expectToolCall({
      client: harness.client,
      toolId: 'manage_sharing',
      input: {
        action: 'grant',
        calendarId,
        scopeType: 'default',
        role: 'reader'
      }
    });
    expect(granted.output.rule?.ruleId).toBeTruthy();

    let updated = await expectToolCall({
      client: harness.client,
      toolId: 'manage_sharing',
      input: {
        action: 'update',
        calendarId,
        ruleId: granted.output.rule?.ruleId,
        role: 'freeBusyReader'
      }
    });
    expect(updated.output.rule?.role).toBe('freeBusyReader');

    let revoked = await expectToolCall({
      client: harness.client,
      toolId: 'manage_sharing',
      input: {
        action: 'revoke',
        calendarId,
        ruleId: granted.output.rule?.ruleId
      }
    });
    expect(revoked.output.deleted).toBe(true);
  });

  it('fails fast on branch-specific validation errors', async context => {
    skipIfMissingScopes(context);

    let harness = getHarness();

    await expectSlateError(
      () =>
        harness.client.invokeTool('manage_sharing', {
          action: 'grant',
          calendarId: 'primary'
        }),
      { code: 'internal.unexpected', kind: 'internal', status: 500 }
    );
    await expectSlateError(
      () =>
        harness.client.invokeTool('manage_sharing', {
          action: 'update',
          calendarId: 'primary'
        }),
      { code: 'internal.unexpected', kind: 'internal', status: 500 }
    );
    await expectSlateError(
      () =>
        harness.client.invokeTool('manage_sharing', {
          action: 'revoke',
          calendarId: 'primary'
        }),
      { code: 'internal.unexpected', kind: 'internal', status: 500 }
    );
  });
});
