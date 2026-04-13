import { expectToolCall } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { createTimedRange, labelForRun, trackEvent } from '../test-helpers/live-fixtures';
import { setupGoogleCalendarLiveHarness } from './test-helpers';

let { getHarness, skipIfMissingScopes } = setupGoogleCalendarLiveHarness();

describe.sequential('google-calendar find_free_busy', () => {
  it('returns busy slots for a known event window', async context => {
    skipIfMissingScopes(context);

    let harness = getHarness();
    let freeBusyRange = createTimedRange(4, 60);

    let created = await expectToolCall({
      client: harness.client,
      toolId: 'create_event',
      input: {
        calendarId: 'primary',
        summary: labelForRun(harness, 'free busy event'),
        start: { dateTime: freeBusyRange.start, timeZone: 'UTC' },
        end: { dateTime: freeBusyRange.end, timeZone: 'UTC' },
        sendUpdates: 'none'
      }
    });
    trackEvent(harness, 'primary', created.output.eventId!);

    let freeBusy = await expectToolCall({
      client: harness.client,
      toolId: 'find_free_busy',
      input: {
        timeMin: new Date(Date.parse(freeBusyRange.start) - 60 * 60 * 1000).toISOString(),
        timeMax: new Date(Date.parse(freeBusyRange.end) + 60 * 60 * 1000).toISOString(),
        calendarIds: ['primary'],
        timeZone: 'UTC'
      }
    });

    expect(freeBusy.output.calendars.primary?.busy.length ?? 0).toBeGreaterThan(0);
  });
});
