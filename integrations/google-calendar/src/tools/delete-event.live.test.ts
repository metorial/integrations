import { expectToolCall } from '@slates/test';
import { describe, expect, it } from 'vitest';
import {
  createTimedRange,
  labelForRun,
  trackEvent,
  untrackEvent
} from '../test-helpers/live-fixtures';
import { setupGoogleCalendarLiveHarness } from './test-helpers';

let { getHarness, skipIfMissingScopes } = setupGoogleCalendarLiveHarness();

describe.sequential('google-calendar delete_event', () => {
  it('deletes an event and returns the deleted id', async context => {
    skipIfMissingScopes(context);

    let harness = getHarness();
    let timedRange = createTimedRange(3, 45);

    let created = await expectToolCall({
      client: harness.client,
      toolId: 'create_event',
      input: {
        calendarId: 'primary',
        summary: labelForRun(harness, 'deletable event'),
        start: { dateTime: timedRange.start, timeZone: 'UTC' },
        end: { dateTime: timedRange.end, timeZone: 'UTC' },
        sendUpdates: 'none'
      }
    });
    trackEvent(harness, 'primary', created.output.eventId!);

    let deleted = await expectToolCall({
      client: harness.client,
      toolId: 'delete_event',
      input: {
        calendarId: 'primary',
        eventId: created.output.eventId,
        sendUpdates: 'none'
      },
      output: {
        deleted: true,
        eventId: created.output.eventId
      }
    });

    expect(deleted.output.deleted).toBe(true);
    untrackEvent(harness, 'primary', created.output.eventId!);
  });
});
