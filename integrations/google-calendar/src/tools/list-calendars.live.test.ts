import { expectToolCall } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { setupGoogleCalendarLiveHarness } from './test-helpers';

let { getHarness, skipIfMissingScopes } = setupGoogleCalendarLiveHarness();

describe.sequential('google-calendar list_calendars', () => {
  it('lists calendars and includes the primary calendar', async context => {
    skipIfMissingScopes(context);

    let harness = getHarness();

    let calendars = await expectToolCall({
      client: harness.client,
      toolId: 'list_calendars',
      input: {
        showHidden: true,
        showDeleted: true
      }
    });

    expect(calendars.output.totalResults).toBeGreaterThan(0);
    expect(
      calendars.output.calendars.some(
        (calendar: { calendarId?: string; primary?: boolean }) =>
          calendar.calendarId === 'primary' || calendar.primary === true
      )
    ).toBe(true);
  });
});
