import { expectToolCall } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { createTimedRange, labelForRun, trackEvent } from '../test-helpers/live-fixtures';
import { setupGoogleCalendarLiveHarness } from './test-helpers';

let { getHarness, skipIfMissingScopes } = setupGoogleCalendarLiveHarness();

describe.sequential('google-calendar get_event', () => {
  it('retrieves the full details for a created event', async context => {
    skipIfMissingScopes(context);

    let harness = getHarness();
    let timedRange = createTimedRange(3, 45);

    let created = await expectToolCall({
      client: harness.client,
      toolId: 'create_event',
      input: {
        calendarId: 'primary',
        summary: labelForRun(harness, 'get event'),
        description: 'Created for get_event coverage',
        start: { dateTime: timedRange.start, timeZone: 'UTC' },
        end: { dateTime: timedRange.end, timeZone: 'UTC' },
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 15 }]
        },
        visibility: 'private',
        sendUpdates: 'none'
      }
    });
    trackEvent(harness, 'primary', created.output.eventId!);

    let fetched = await expectToolCall({
      client: harness.client,
      toolId: 'get_event',
      input: {
        calendarId: 'primary',
        eventId: created.output.eventId
      }
    });

    expect(fetched.output.eventId).toBe(created.output.eventId);
    expect(fetched.output.summary).toContain(harness.runId);
    expect(fetched.output.visibility).toBe('private');
    expect(fetched.output.reminders?.useDefault).toBe(false);
  });
});
