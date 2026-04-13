import { expectToolCall } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { createTimedRange, labelForRun, trackEvent } from '../test-helpers/live-fixtures';
import { setupGoogleCalendarLiveHarness } from './test-helpers';

let { getHarness, skipIfMissingScopes } = setupGoogleCalendarLiveHarness();

describe.sequential('google-calendar list_events', () => {
  it('lists events with search and time-window filters', async context => {
    skipIfMissingScopes(context);

    let harness = getHarness();
    let timedRange = createTimedRange(3, 45);

    let created = await expectToolCall({
      client: harness.client,
      toolId: 'create_event',
      input: {
        calendarId: 'primary',
        summary: labelForRun(harness, 'listed event'),
        start: { dateTime: timedRange.start, timeZone: 'UTC' },
        end: { dateTime: timedRange.end, timeZone: 'UTC' },
        sendUpdates: 'none'
      }
    });
    trackEvent(harness, 'primary', created.output.eventId!);

    let listed = await expectToolCall({
      client: harness.client,
      toolId: 'list_events',
      input: {
        calendarId: 'primary',
        q: harness.runId,
        singleEvents: true,
        orderBy: 'startTime',
        timeMin: new Date(Date.parse(timedRange.start) - 60 * 60 * 1000).toISOString(),
        timeMax: new Date(Date.parse(timedRange.end) + 60 * 60 * 1000).toISOString()
      }
    });

    expect(
      listed.output.events.some(
        (event: { eventId?: string; summary?: string }) =>
          event.eventId === created.output.eventId && event.summary?.includes(harness.runId)
      )
    ).toBe(true);
  });
});
