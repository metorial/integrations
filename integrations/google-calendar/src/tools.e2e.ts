import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { provider } from './index';

let DEFAULT_EVENT_START_HOUR_UTC = 15;
let DEFAULT_EVENT_DURATION_MINUTES = 45;

let createTimedRange = (daysFromNow: number, durationMinutes = DEFAULT_EVENT_DURATION_MINUTES) => {
  let start = new Date();
  start.setUTCDate(start.getUTCDate() + daysFromNow);
  start.setUTCHours(DEFAULT_EVENT_START_HOUR_UTC, 0, 0, 0);

  let end = new Date(start);
  end.setUTCMinutes(end.getUTCMinutes() + durationMinutes);

  return {
    timeMin: start.toISOString(),
    timeMax: end.toISOString()
  };
};

let createQuickAddText = (runId: string, daysFromNow = 5) => {
  let target = new Date();
  target.setUTCDate(target.getUTCDate() + daysFromNow);

  let month = target.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  let day = target.getUTCDate();
  let year = target.getUTCFullYear();

  return `${runId} quick add on ${month} ${day}, ${year} at 3:00 PM UTC`;
};

let createSharingGrantInput = () => ({
  scopeType: 'default' as const,
  role: 'reader' as const
});

export let googleCalendarToolE2E = defineSlateToolE2EIntegration({
  beforeSuite: async ctx => {
    try {
      await ctx.invokeTool('list_calendars', {});
    } catch (error) {
      let message = error instanceof Error ? error.message : String(error);
      if (message.includes('must be signed up for Google Calendar')) {
        throw new Error(
          'The selected Google account is authenticated, but Google Calendar is not enabled for it. Use an account that is signed up for Google Calendar.'
        );
      }
      throw error;
    }
  },
  resources: {
    calendar: {
      create: async ctx => {
        let input = {
          action: 'create' as const,
          summary: ctx.namespaced('calendar'),
          description: `Created by ${ctx.runId}`,
          timeZone: 'UTC'
        };
        let result = await ctx.invokeTool('manage_calendar', input);
        return {
          ...result.output,
          summary: input.summary,
          description: input.description
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (!value.calendarId) {
            return;
          }
          await ctx.invokeTool('manage_calendar', {
            action: 'delete',
            calendarId: String(value.calendarId)
          });
        }
      }
    },
    sharing_rule: {
      use: ['calendar'],
      create: async ctx => {
        let calendar = ctx.resource('calendar');
        let grantInput = createSharingGrantInput();
        let result = await ctx.invokeTool('manage_sharing', {
          action: 'grant',
          calendarId: String(calendar.calendarId),
          ...grantInput
        });
        let ruleId = result.output.rule?.ruleId;
        if (!ruleId) {
          throw new Error('manage_sharing grant did not return a ruleId.');
        }

        return {
          calendarId: String(calendar.calendarId),
          ruleId,
          scopeType: result.output.rule?.scopeType ?? grantInput.scopeType,
          scopeValue: result.output.rule?.scopeValue,
          role: result.output.rule?.role ?? grantInput.role
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (!value.calendarId || !value.ruleId) {
            return;
          }
          await ctx.invokeTool('manage_sharing', {
            action: 'revoke',
            calendarId: String(value.calendarId),
            ruleId: String(value.ruleId)
          });
        }
      }
    },
    quick_event: {
      create: async ctx => {
        let input = {
          calendarId: 'primary',
          text: createQuickAddText(ctx.runId),
          sendUpdates: 'none' as const
        };
        let result = await ctx.invokeTool('quick_add_event', input);
        return {
          ...result.output,
          calendarId: input.calendarId,
          text: input.text
        };
      },
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (!value.calendarId || !value.eventId) {
            return;
          }
          await ctx.invokeTool('delete_event', {
            calendarId: String(value.calendarId),
            eventId: String(value.eventId),
            sendUpdates: 'none'
          });
        }
      }
    }
  },
  scenarioOverrides: {
    manage_calendar: [
      {
        name: 'manage_calendar updates a secondary calendar',
        use: ['calendar'],
        run: async ctx => {
          let calendar = ctx.resource('calendar');
          let update = await ctx.invokeTool('manage_calendar', {
            action: 'update',
            calendarId: String(calendar.calendarId),
            summary: ctx.namespaced('calendar updated'),
            description: `Updated by ${ctx.runId}`,
            timeZone: 'UTC'
          });

          ctx.updateResource('calendar', update.output);
        }
      },
      {
        name: 'manage_calendar creates and deletes a secondary calendar',
        run: async ctx => {
          let created = await ctx.invokeTool('manage_calendar', {
            action: 'create',
            summary: ctx.namespaced('calendar disposable'),
            description: `Created by ${ctx.runId}`,
            timeZone: 'UTC'
          });
          let calendarId = created.output.calendarId;
          if (!calendarId) {
            throw new Error('manage_calendar create did not return a calendarId.');
          }

          let deleted = await ctx.invokeTool('manage_calendar', {
            action: 'delete',
            calendarId,
          });
          if (!deleted.output.deleted) {
            throw new Error('manage_calendar delete did not confirm deletion.');
          }
        }
      }
    ],
    quick_add_event: {
      name: 'quick_add_event creates a live event',
      use: ['quick_event'],
      run: async () => {}
    },
    find_free_busy: {
      name: 'find_free_busy returns availability for the primary calendar',
      run: async ctx => {
        let range = createTimedRange(7);
        await ctx.invokeTool('find_free_busy', {
          timeMin: range.timeMin,
          timeMax: range.timeMax,
          calendarIds: ['primary'],
          timeZone: 'UTC'
        });
      }
    },
    manage_sharing: [
      {
        name: 'manage_sharing lists and updates a rule',
        use: ['calendar', 'sharing_rule'],
        run: async ctx => {
          let calendar = ctx.resource('calendar');
          let rule = ctx.resource('sharing_rule');
          let list = await ctx.invokeTool('manage_sharing', {
            action: 'list',
            calendarId: String(calendar.calendarId)
          });

          if (
            !list.output.rules?.some(
              (candidate: { ruleId?: string }) => candidate.ruleId === String(rule.ruleId)
            )
          ) {
            throw new Error('manage_sharing list did not include the tracked rule.');
          }

          let update = await ctx.invokeTool('manage_sharing', {
            action: 'update',
            calendarId: String(calendar.calendarId),
            ruleId: String(rule.ruleId),
            role: 'freeBusyReader'
          });

          ctx.updateResource('sharing_rule', {
            role: update.output.rule?.role ?? 'freeBusyReader'
          });
        }
      },
      {
        name: 'manage_sharing revokes and re-grants a rule',
        use: ['calendar', 'sharing_rule'],
        run: async ctx => {
          let calendar = ctx.resource('calendar');
          let rule = ctx.resource('sharing_rule');
          let calendarId = String(calendar.calendarId);

          await ctx.invokeTool('manage_sharing', {
            action: 'revoke',
            calendarId,
            ruleId: String(rule.ruleId)
          });

          let grantInput = createSharingGrantInput();
          let grant = await ctx.invokeTool('manage_sharing', {
            action: 'grant',
            calendarId,
            ...grantInput
          });
          let ruleId = grant.output.rule?.ruleId;
          if (!ruleId) {
            throw new Error('manage_sharing re-grant did not return a ruleId.');
          }

          ctx.updateResource('sharing_rule', {
            calendarId,
            ruleId,
            scopeType: grant.output.rule?.scopeType ?? grantInput.scopeType,
            scopeValue: grant.output.rule?.scopeValue,
            role: grant.output.rule?.role ?? grantInput.role
          });
        }
      }
    ]
  }
});

runSlateToolE2ESuite({
  provider,
  integration: googleCalendarToolE2E
});
