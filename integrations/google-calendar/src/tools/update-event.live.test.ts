import { expectToolCall } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { createTimedRange, labelForRun, trackEvent } from '../test-helpers/live-fixtures';
import { setupGoogleCalendarLiveHarness } from './test-helpers';

let { getHarness, skipIfMissingScopes } = setupGoogleCalendarLiveHarness();

describe.sequential('google-calendar update_event', () => {
  it('updates an event in place and moves it to another calendar', async context => {
    skipIfMissingScopes(context);

    let harness = getHarness();
    let timedRange = createTimedRange(3, 45);

    let created = await expectToolCall({
      client: harness.client,
      toolId: 'create_event',
      input: {
        calendarId: 'primary',
        summary: labelForRun(harness, 'updatable event'),
        description: 'Created for update_event coverage',
        start: { dateTime: timedRange.start, timeZone: 'UTC' },
        end: { dateTime: timedRange.end, timeZone: 'UTC' },
        sendUpdates: 'none'
      }
    });
    trackEvent(harness, created.output.calendarId, created.output.eventId!);

    let updated = await expectToolCall({
      client: harness.client,
      toolId: 'update_event',
      input: {
        calendarId: 'primary',
        eventId: created.output.eventId,
        summary: labelForRun(harness, 'updated event'),
        description: 'Updated by the dedicated update_event test',
        transparency: 'transparent',
        sendUpdates: 'none'
      }
    });
    expect(updated.output.summary).toContain('updated event');
  });
});
