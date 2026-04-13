import { SlateTool } from 'slates';
import { AnalyticsAdminClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let auditDataAccess = SlateTool.create(spec, {
  name: 'Audit Data Access',
  key: 'audit_data_access',
  description: `Generate a data access report to audit who accessed your analytics data and when. Shows which users and service accounts made data requests against the GA4 property.

This helps with compliance and security monitoring by tracking API and UI data access patterns.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      startDate: z.string().describe('Start date in YYYY-MM-DD format.'),
      endDate: z.string().describe('End date in YYYY-MM-DD format.'),
      dimensions: z
        .array(
          z.enum([
            'accessorEmail',
            'accessMechanism',
            'epochTimeMicros',
            'propertyId',
            'propertyName',
            'quotaCategory',
            'reportType',
            'isRestrictedDataModel'
          ])
        )
        .optional()
        .describe('Dimensions for the access report. Common: accessorEmail, accessMechanism.'),
      metrics: z
        .array(z.enum(['accessCount']))
        .optional()
        .describe('Metrics for the access report. Default: accessCount.'),
      limit: z.number().optional().describe('Maximum number of rows to return.'),
      offset: z.number().optional().describe('Row offset for pagination.')
    })
  )
  .output(
    z.object({
      dimensionHeaders: z
        .array(
          z.object({
            dimensionName: z.string().optional()
          })
        )
        .optional(),
      metricHeaders: z
        .array(
          z.object({
            metricName: z.string().optional()
          })
        )
        .optional(),
      rows: z
        .array(
          z.object({
            dimensionValues: z.array(z.object({ value: z.string() })).optional(),
            metricValues: z.array(z.object({ value: z.string() })).optional()
          })
        )
        .optional(),
      rowCount: z.number().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new AnalyticsAdminClient({
      token: ctx.auth.token,
      propertyId: ctx.config.propertyId
    });

    let requestDimensions = (ctx.input.dimensions || ['accessorEmail', 'accessMechanism']).map(
      d => ({ dimensionName: d })
    );
    let requestMetrics = (ctx.input.metrics || ['accessCount']).map(m => ({ metricName: m }));

    let result = await client.runAccessReport({
      dateRanges: [{ startDate: ctx.input.startDate, endDate: ctx.input.endDate }],
      dimensions: requestDimensions,
      metrics: requestMetrics,
      limit: ctx.input.limit,
      offset: ctx.input.offset
    });

    let rowCount = result.rowCount || (result.rows ? result.rows.length : 0);

    return {
      output: {
        dimensionHeaders: result.dimensionHeaders,
        metricHeaders: result.metricHeaders,
        rows: result.rows || [],
        rowCount: rowCount
      },
      message: `Data access report returned **${rowCount}** record(s) for ${ctx.input.startDate} to ${ctx.input.endDate}.`
    };
  })
  .build();
