import { SlateTool } from 'slates';
import { AnalyticsAdminClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageCustomMetrics = SlateTool.create(spec, {
  name: 'Manage Custom Metrics',
  key: 'manage_custom_metrics',
  description: `List, create, update, or archive custom metrics on a GA4 property. Custom metrics allow you to track numerical data beyond the built-in metrics.

Use **list** to see all custom metrics, **create** to add new ones, **update** to modify display names, descriptions, or measurement units, and **archive** to remove them.`,
  tags: {
    destructive: false
  }
})
  .input(
    z.object({
      action: z
        .enum(['list', 'create', 'update', 'archive'])
        .describe('Action to perform on custom metrics.'),
      customMetricId: z
        .string()
        .optional()
        .describe('ID of the custom metric (required for update and archive actions).'),
      parameterName: z
        .string()
        .optional()
        .describe(
          'Event parameter name for the custom metric (required for create). Cannot be changed after creation.'
        ),
      displayName: z
        .string()
        .optional()
        .describe(
          'Display name for the custom metric (required for create, optional for update).'
        ),
      description: z.string().optional().describe('Description of the custom metric.'),
      scope: z
        .enum(['EVENT'])
        .optional()
        .describe(
          'Scope of the custom metric (required for create). Currently only EVENT scope is supported.'
        ),
      measurementUnit: z
        .enum([
          'STANDARD',
          'CURRENCY',
          'FEET',
          'METERS',
          'KILOMETERS',
          'MILES',
          'MILLISECONDS',
          'SECONDS',
          'MINUTES',
          'HOURS'
        ])
        .optional()
        .describe('Measurement unit for the custom metric (required for create).'),
      pageSize: z.number().optional().describe('Number of results per page for list action.'),
      pageToken: z.string().optional().describe('Page token for pagination in list action.')
    })
  )
  .output(
    z.object({
      customMetrics: z
        .array(
          z.object({
            name: z.string().optional(),
            parameterName: z.string().optional(),
            displayName: z.string().optional(),
            description: z.string().optional(),
            scope: z.string().optional(),
            measurementUnit: z.string().optional(),
            restrictedMetricType: z.array(z.string()).optional()
          })
        )
        .optional()
        .describe('List of custom metrics (for list action).'),
      customMetric: z
        .object({
          name: z.string().optional(),
          parameterName: z.string().optional(),
          displayName: z.string().optional(),
          description: z.string().optional(),
          scope: z.string().optional(),
          measurementUnit: z.string().optional(),
          restrictedMetricType: z.array(z.string()).optional()
        })
        .optional()
        .describe('Created or updated custom metric (for create/update actions).'),
      nextPageToken: z.string().optional(),
      archived: z
        .boolean()
        .optional()
        .describe('Whether the custom metric was archived (for archive action).')
    })
  )
  .handleInvocation(async ctx => {
    let client = new AnalyticsAdminClient({
      token: ctx.auth.token,
      propertyId: ctx.config.propertyId
    });

    if (ctx.input.action === 'list') {
      let result = await client.listCustomMetrics({
        pageSize: ctx.input.pageSize,
        pageToken: ctx.input.pageToken
      });
      return {
        output: {
          customMetrics: result.customMetrics || [],
          nextPageToken: result.nextPageToken
        },
        message: `Found **${(result.customMetrics || []).length}** custom metric(s).`
      };
    }

    if (ctx.input.action === 'create') {
      if (
        !ctx.input.parameterName ||
        !ctx.input.displayName ||
        !ctx.input.scope ||
        !ctx.input.measurementUnit
      ) {
        throw new Error(
          'parameterName, displayName, scope, and measurementUnit are required for creating a custom metric.'
        );
      }
      let result = await client.createCustomMetric({
        parameterName: ctx.input.parameterName,
        displayName: ctx.input.displayName,
        description: ctx.input.description,
        scope: ctx.input.scope,
        measurementUnit: ctx.input.measurementUnit
      });
      return {
        output: { customMetric: result },
        message: `Created custom metric **${result.displayName}** (parameter: ${result.parameterName}, unit: ${result.measurementUnit}).`
      };
    }

    if (ctx.input.action === 'update') {
      if (!ctx.input.customMetricId) {
        throw new Error('customMetricId is required for updating a custom metric.');
      }
      let updateFields: string[] = [];
      let body: any = {};
      if (ctx.input.displayName !== undefined) {
        updateFields.push('displayName');
        body.displayName = ctx.input.displayName;
      }
      if (ctx.input.description !== undefined) {
        updateFields.push('description');
        body.description = ctx.input.description;
      }
      if (ctx.input.measurementUnit !== undefined) {
        updateFields.push('measurementUnit');
        body.measurementUnit = ctx.input.measurementUnit;
      }
      if (updateFields.length === 0) {
        throw new Error('At least one field must be provided for update.');
      }
      let result = await client.updateCustomMetric(
        ctx.input.customMetricId,
        updateFields.join(','),
        body
      );
      return {
        output: { customMetric: result },
        message: `Updated custom metric **${result.displayName}**.`
      };
    }

    if (ctx.input.action === 'archive') {
      if (!ctx.input.customMetricId) {
        throw new Error('customMetricId is required for archiving a custom metric.');
      }
      await client.archiveCustomMetric(ctx.input.customMetricId);
      return {
        output: { archived: true },
        message: `Archived custom metric **${ctx.input.customMetricId}**.`
      };
    }

    throw new Error(`Unknown action: ${ctx.input.action}`);
  })
  .build();
