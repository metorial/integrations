import { expectToolCall } from '@slates/test';
import { describe, expect, it } from 'vitest';
import { setupGoogleCalendarLiveHarness } from './test-helpers';

let { getHarness, skipIfMissingScopes } = setupGoogleCalendarLiveHarness();

describe.sequential('google-calendar get_colors', () => {
  it('returns calendar and event color definitions', async context => {
    skipIfMissingScopes(context);

    let harness = getHarness();
    let colors = await expectToolCall({
      client: harness.client,
      toolId: 'get_colors',
      input: {}
    });

    expect(Object.keys(colors.output.calendarColors)).not.toHaveLength(0);
    expect(Object.keys(colors.output.eventColors)).not.toHaveLength(0);
  });
});
