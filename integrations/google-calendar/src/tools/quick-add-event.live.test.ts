import { expectToolCall } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { createQuickAddText, trackEvent, untrackEvent } from '../test-helpers/live-fixtures';
import { setupGoogleCalendarLiveHarness } from './test-helpers';

let { getHarness, skipIfMissingScopes } = setupGoogleCalendarLiveHarness();

describe.sequential('google-calendar quick_add_event', () => {
  it('creates an event from natural language text', async context => {
    skipIfMissingScopes(context);

    let harness = getHarness();
    let quickAdd = await expectToolCall({
      client: harness.client,
      toolId: 'quick_add_event',
      input: {
        calendarId: 'primary',
        text: createQuickAddText(harness),
        sendUpdates: 'none'
      }
    });

    expect(quickAdd.output.eventId).toBeTruthy();
    expect(quickAdd.output.summary).toContain(harness.runId);
    trackEvent(harness, 'primary', quickAdd.output.eventId!);

    await expectToolCall({
      client: harness.client,
      toolId: 'delete_event',
      input: {
        calendarId: 'primary',
        eventId: quickAdd.output.eventId,
        sendUpdates: 'none'
      },
      output: {
        deleted: true,
        eventId: quickAdd.output.eventId
      }
    });
    untrackEvent(harness, 'primary', quickAdd.output.eventId!);
  });
});
