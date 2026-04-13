import { expectSlateError, expectToolCall } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { createManagedCalendar, labelForRun } from '../test-helpers/live-fixtures';
import { setupGoogleCalendarLiveHarness } from './test-helpers';

let { getHarness, skipIfMissingScopes } = setupGoogleCalendarLiveHarness();

describe.sequential('google-calendar manage_calendar', () => {
  it('creates and updates a managed calendar', async context => {
    skipIfMissingScopes(context);

    let harness = getHarness();
    let updatedSummary = labelForRun(harness, 'updated calendar');
    let managedCalendar = await createManagedCalendar(harness, 'managed calendar');

    let updated = await expectToolCall({
      client: harness.client,
      toolId: 'manage_calendar',
      input: {
        action: 'update',
        calendarId: managedCalendar.calendarId,
        summary: updatedSummary,
        description: 'Updated by the dedicated manage_calendar test',
        location: 'Remote',
        timeZone: 'UTC'
      },
      output: {
        calendarId: managedCalendar.calendarId,
        summary: updatedSummary,
        timeZone: 'UTC',
        action: 'update'
      }
    });

    expect(updated.output.description).toBe('Updated by the dedicated manage_calendar test');
  });

  it('subscribes to and unsubscribes from a non-owned calendar', async context => {
    skipIfMissingScopes(context);

    let harness = getHarness();
    let calendars = await expectToolCall({
      client: harness.client,
      toolId: 'list_calendars',
      input: {
        showHidden: true
      }
    });

    let subscriptionCandidate =
      calendars.output.calendars.find(
        (calendar: { calendarId?: string; accessRole?: string; primary?: boolean }) =>
          calendar.calendarId && !calendar.primary && calendar.accessRole !== 'owner'
      )?.calendarId ?? 'en.usa#holiday@group.v.calendar.google.com';

    try {
      await harness.client.invokeTool('manage_calendar', {
        action: 'unsubscribe',
        calendarId: subscriptionCandidate
      });
    } catch {}

    let subscribed = await expectToolCall({
      client: harness.client,
      toolId: 'manage_calendar',
      input: {
        action: 'subscribe',
        calendarId: subscriptionCandidate,
        hidden: false,
        selected: true,
        summaryOverride: labelForRun(harness, 'subscribed calendar')
      },
      output: {
        calendarId: subscriptionCandidate,
        action: 'subscribe'
      }
    });
    expect(subscribed.output.summary || subscribed.output.calendarId).toBeTruthy();

    let unsubscribed = await expectToolCall({
      client: harness.client,
      toolId: 'manage_calendar',
      input: {
        action: 'unsubscribe',
        calendarId: subscriptionCandidate
      },
      output: {
        calendarId: subscriptionCandidate,
        deleted: true,
        action: 'unsubscribe'
      }
    });
    expect(unsubscribed.output.deleted).toBe(true);
  });

  it('fails fast on branch-specific validation errors', async context => {
    skipIfMissingScopes(context);

    let harness = getHarness();

    await expectSlateError(
      () => harness.client.invokeTool('manage_calendar', { action: 'create' }),
      { code: 'internal.unexpected', kind: 'internal', status: 500 }
    );
    await expectSlateError(
      () => harness.client.invokeTool('manage_calendar', { action: 'update' }),
      { code: 'internal.unexpected', kind: 'internal', status: 500 }
    );
    await expectSlateError(
      () => harness.client.invokeTool('manage_calendar', { action: 'delete' }),
      { code: 'internal.unexpected', kind: 'internal', status: 500 }
    );
    await expectSlateError(
      () => harness.client.invokeTool('manage_calendar', { action: 'subscribe' }),
      { code: 'internal.unexpected', kind: 'internal', status: 500 }
    );
    await expectSlateError(
      () => harness.client.invokeTool('manage_calendar', { action: 'unsubscribe' }),
      { code: 'internal.unexpected', kind: 'internal', status: 500 }
    );
  });
});
