import { SlateTrigger, SlateDefaultPollingIntervalSeconds } from 'slates';
import { AnalyticsAdminClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let propertyChange = SlateTrigger.create(
  spec,
  {
    name: 'Property Change',
    key: 'property_change',
    description: 'Polls for configuration changes on a GA4 property, including updates to data streams, custom dimensions, custom metrics, key events, audiences, and other property settings.',
  }
)
  .input(z.object({
    changeId: z.string().describe('Unique ID for this change history event.'),
    changeTime: z.string().describe('Timestamp of the change.'),
    actorEmail: z.string().optional().describe('Email of the user who made the change.'),
    actorType: z.string().optional().describe('Type of actor (USER, SYSTEM, SUPPORT).'),
    resourceType: z.string().describe('Type of resource that was changed.'),
    action: z.string().describe('The action performed (CREATED, UPDATED, DELETED).'),
    resourceBeforeChange: z.any().optional().describe('Resource state before the change.'),
    resourceAfterChange: z.any().optional().describe('Resource state after the change.'),
  }))
  .output(z.object({
    changeId: z.string().describe('Unique ID for this change history event.'),
    changeTime: z.string().describe('Timestamp when the change occurred.'),
    actorEmail: z.string().optional().describe('Email of the user or service account who made the change.'),
    actorType: z.string().optional().describe('Type of actor: USER, SYSTEM, or SUPPORT.'),
    resourceType: z.string().describe('Type of resource changed (e.g., DATA_STREAM, CUSTOM_DIMENSION, KEY_EVENT).'),
    action: z.string().describe('Action performed: CREATED, UPDATED, or DELETED.'),
    resourceBeforeChange: z.any().optional().describe('Snapshot of the resource before the change.'),
    resourceAfterChange: z.any().optional().describe('Snapshot of the resource after the change.'),
  }))
  .polling({
    options: {
      intervalInSeconds: SlateDefaultPollingIntervalSeconds,
    },

    pollEvents: async (ctx) => {
      let client = new AnalyticsAdminClient({
        token: ctx.auth.token,
        propertyId: ctx.config.propertyId,
      });

      let lastPollTime = ctx.state?.lastPollTime as string | undefined;
      let now = new Date().toISOString();

      let params: any = {
        pageSize: 100,
      };

      if (lastPollTime) {
        params.earliestChangeTime = lastPollTime;
        params.latestChangeTime = now;
      } else {
        // First poll: look back 1 hour
        let oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        params.earliestChangeTime = oneHourAgo;
        params.latestChangeTime = now;
      }

      let result = await client.searchChangeHistoryEvents(params);
      let changeEvents = result.changeHistoryEvents || [];

      let inputs = changeEvents.flatMap((event: any) => {
        let changes = event.changes || [];
        return changes.map((change: any) => ({
          changeId: `${event.id || ''}-${change.resource || ''}`,
          changeTime: event.changeTime || now,
          actorEmail: event.userActorEmail,
          actorType: event.actorType,
          resourceType: change.resourceType || 'UNKNOWN',
          action: change.action || 'UNKNOWN',
          resourceBeforeChange: change.resourceBeforeChange,
          resourceAfterChange: change.resourceAfterChange,
        }));
      });

      return {
        inputs,
        updatedState: {
          lastPollTime: now,
        },
      };
    },

    handleEvent: async (ctx) => {
      let action = (ctx.input.action || 'unknown').toLowerCase();
      let resourceType = (ctx.input.resourceType || 'resource').toLowerCase().replace(/_/g, '_');

      return {
        type: `${resourceType}.${action}`,
        id: ctx.input.changeId,
        output: {
          changeId: ctx.input.changeId,
          changeTime: ctx.input.changeTime,
          actorEmail: ctx.input.actorEmail,
          actorType: ctx.input.actorType,
          resourceType: ctx.input.resourceType,
          action: ctx.input.action,
          resourceBeforeChange: ctx.input.resourceBeforeChange,
          resourceAfterChange: ctx.input.resourceAfterChange,
        },
      };
    },
  })
  .build();
