import { expectToolCall } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { createTimedRange, labelForRun, trackEvent } from '../test-helpers/live-fixtures';
import { setupGoogleCalendarLiveHarness } from './test-helpers';

let { getHarness, skipIfMissingScopes } = setupGoogleCalendarLiveHarness();

describe.sequential('google-calendar create_event', () => {
  it('creates a rich event payload on a managed calendar', async context => {
    skipIfMissingScopes(context);

    let harness = getHarness();
    let timedRange = createTimedRange(3, 45);
    let colors = await expectToolCall({
      client: harness.client,
      toolId: 'get_colors',
      input: {}
    });
    let [eventColorId] = Object.keys(colors.output.eventColors);

    let created = await expectToolCall({
      client: harness.client,
      toolId: 'create_event',
      input: {
        calendarId: 'primary',
        summary: labelForRun(harness, 'created event'),
        description: 'Created by the dedicated create_event test',
        location: 'Conference Room',
        start: { dateTime: timedRange.start, timeZone: 'UTC' },
        end: { dateTime: timedRange.end, timeZone: 'UTC' },
        attendees: [
          {
            email: `${harness.runId}@example.com`,
            displayName: 'Synthetic attendee',
            optional: true,
            comment: 'Tracked by tests'
          }
        ],
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 10 }]
        },
        colorId: eventColorId,
        visibility: 'private',
        transparency: 'opaque',
        guestsCanModify: false,
        guestsCanInviteOthers: false,
        guestsCanSeeOtherGuests: true,
        sendUpdates: 'none'
      }
    });

    expect(created.output.eventId).toBeTruthy();
    expect(created.output.summary).toContain(harness.runId);
    expect(Date.parse(String(created.output.start?.dateTime))).toBe(
      Date.parse(timedRange.start)
    );
    trackEvent(harness, 'primary', created.output.eventId!);
  });
});
