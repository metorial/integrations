import { SlateTool } from 'slates';
import { spec } from '../spec';
import { z } from 'zod';
import { clientFromContext, flattenList, flattenParams } from '../lib/helpers';
import { extractXmlValue, extractXmlValues, extractXmlBlocks } from '../lib/xml';

let CW_VERSION = '2010-08-01';
let CW_SERVICE = 'monitoring';

let dimensionSchema = z.object({
  name: z.string().describe('Dimension name'),
  value: z.string().describe('Dimension value'),
});

let alarmSchema = z.object({
  alarmName: z.string().describe('Name of the alarm'),
  alarmArn: z.string().optional().describe('ARN of the alarm'),
  alarmDescription: z.string().optional().describe('Description of the alarm'),
  stateValue: z.string().optional().describe('Current state of the alarm (OK, ALARM, INSUFFICIENT_DATA)'),
  stateReason: z.string().optional().describe('Human-readable explanation for the alarm state'),
  stateUpdatedTimestamp: z.string().optional().describe('Timestamp when the alarm state was last updated'),
  metricName: z.string().optional().describe('Name of the metric associated with the alarm'),
  namespace: z.string().optional().describe('Namespace of the metric'),
  statistic: z.string().optional().describe('Statistic for the metric (SampleCount, Average, Sum, Minimum, Maximum)'),
  period: z.number().optional().describe('Period in seconds over which the statistic is applied'),
  evaluationPeriods: z.number().optional().describe('Number of periods over which data is compared to the threshold'),
  threshold: z.number().optional().describe('Value against which the statistic is compared'),
  comparisonOperator: z.string().optional().describe('Comparison operator used for the alarm'),
  actionsEnabled: z.boolean().optional().describe('Whether actions are enabled for the alarm'),
  alarmActions: z.array(z.string()).optional().describe('List of action ARNs executed when the alarm transitions to ALARM state'),
  dimensions: z.array(dimensionSchema).optional().describe('Dimensions associated with the alarm metric'),
});

let metricSchema = z.object({
  metricName: z.string().describe('Name of the metric'),
  namespace: z.string().describe('Namespace of the metric'),
  dimensions: z.array(dimensionSchema).optional().describe('Dimensions associated with the metric'),
});

let datapointSchema = z.object({
  timestamp: z.string().describe('Timestamp of the datapoint'),
  sampleCount: z.number().optional().describe('Number of data points used for the statistical calculation'),
  average: z.number().optional().describe('Average of the data points'),
  sum: z.number().optional().describe('Sum of the data points'),
  minimum: z.number().optional().describe('Minimum value of the data points'),
  maximum: z.number().optional().describe('Maximum value of the data points'),
  unit: z.string().optional().describe('Unit of the metric'),
});

let outputSchema = z.object({
  operation: z.string().describe('The operation that was performed'),
  alarms: z.array(alarmSchema).optional().describe('List of alarms (for list_alarms, describe_alarms)'),
  alarm: alarmSchema.optional().describe('Single alarm details (for create_update_alarm)'),
  metrics: z.array(metricSchema).optional().describe('List of metrics (for list_metrics)'),
  datapoints: z.array(datapointSchema).optional().describe('Metric statistics datapoints (for get_metric_statistics)'),
  label: z.string().optional().describe('Label for the metric (for get_metric_statistics)'),
  deletedAlarms: z.array(z.string()).optional().describe('Names of deleted alarms (for delete_alarms)'),
  nextToken: z.string().optional().describe('Token for retrieving the next page of results'),
});

export let manageCloudWatchTool = SlateTool.create(
  spec,
  {
    name: 'Manage CloudWatch',
    key: 'manage_cloudwatch',
    description: `Manage Amazon CloudWatch metrics and alarms. Supports listing and describing alarms, creating or updating metric alarms, deleting alarms, retrieving metric statistics, and listing available metrics. Use this to monitor AWS resources, configure alerting thresholds, and query time-series metric data.`,
    instructions: [
      'Use operation "list_alarms" to list CloudWatch alarms. Optionally filter by "alarmNames" or "stateValue" (OK, ALARM, INSUFFICIENT_DATA). Supports pagination with "maxRecords" and "nextToken".',
      'Use operation "describe_alarms" to get full details for specific alarms by name. Provide "alarmNames" as an array.',
      'Use operation "create_update_alarm" to create a new metric alarm or update an existing one. Requires "alarmName", "namespace", "metricName", "comparisonOperator", "evaluationPeriods", "period", "statistic", and "threshold". Optionally provide "alarmDescription", "alarmActions", "actionsEnabled", and "dimensions".',
      'Use operation "delete_alarms" to delete one or more alarms. Provide "alarmNames" as an array of alarm names to delete.',
      'Use operation "get_metric_statistics" to retrieve statistical data for a metric. Requires "namespace", "metricName", "startTime" (ISO 8601), "endTime" (ISO 8601), "period" (seconds), and "statistics" (e.g., ["Average", "Maximum"]). Optionally filter by "dimensions".',
      'Use operation "list_metrics" to discover available metrics. Optionally filter by "namespace", "metricName", or "dimensions". Supports pagination with "nextToken".',
    ],
    tags: {
      destructive: false,
      readOnly: false,
    },
  }
)
  .input(z.object({
    operation: z.enum([
      'list_alarms',
      'describe_alarms',
      'create_update_alarm',
      'delete_alarms',
      'get_metric_statistics',
      'list_metrics',
    ]).describe('The CloudWatch operation to perform'),
    alarmNames: z.array(z.string()).optional().describe('Alarm names to filter by (for list_alarms, describe_alarms, delete_alarms)'),
    stateValue: z.enum(['OK', 'ALARM', 'INSUFFICIENT_DATA']).optional().describe('Filter alarms by state (for list_alarms)'),
    maxRecords: z.number().optional().describe('Maximum number of alarms to return, up to 100 (for list_alarms)'),
    nextToken: z.string().optional().describe('Pagination token from a previous response'),
    alarmName: z.string().optional().describe('Name of the alarm (required for create_update_alarm)'),
    alarmDescription: z.string().optional().describe('Description of the alarm (for create_update_alarm)'),
    namespace: z.string().optional().describe('Namespace of the metric (e.g., "AWS/EC2", "AWS/RDS"). Required for create_update_alarm, get_metric_statistics'),
    metricName: z.string().optional().describe('Name of the metric (e.g., "CPUUtilization"). Required for create_update_alarm, get_metric_statistics'),
    comparisonOperator: z.enum([
      'GreaterThanOrEqualToThreshold',
      'GreaterThanThreshold',
      'LessThanThreshold',
      'LessThanOrEqualToThreshold',
      'LessThanLowerOrGreaterThanUpperThreshold',
      'LessThanLowerThreshold',
      'GreaterThanUpperThreshold',
    ]).optional().describe('Comparison operator for the alarm threshold (required for create_update_alarm)'),
    evaluationPeriods: z.number().optional().describe('Number of periods over which data is compared to threshold (required for create_update_alarm)'),
    period: z.number().optional().describe('Period in seconds for the metric statistic (required for create_update_alarm, get_metric_statistics)'),
    statistic: z.enum(['SampleCount', 'Average', 'Sum', 'Minimum', 'Maximum']).optional().describe('Statistic to apply to the metric (required for create_update_alarm)'),
    threshold: z.number().optional().describe('Value to compare the metric statistic against (required for create_update_alarm)'),
    actionsEnabled: z.boolean().optional().describe('Whether alarm actions are enabled (for create_update_alarm, defaults to true)'),
    alarmActions: z.array(z.string()).optional().describe('List of ARNs to notify when alarm transitions to ALARM state (for create_update_alarm)'),
    dimensions: z.array(dimensionSchema).optional().describe('Dimensions to filter metrics by (for create_update_alarm, get_metric_statistics, list_metrics)'),
    startTime: z.string().optional().describe('Start of the time range in ISO 8601 format, e.g. "2024-01-01T00:00:00Z" (required for get_metric_statistics)'),
    endTime: z.string().optional().describe('End of the time range in ISO 8601 format, e.g. "2024-01-02T00:00:00Z" (required for get_metric_statistics)'),
    statistics: z.array(z.enum(['SampleCount', 'Average', 'Sum', 'Minimum', 'Maximum'])).optional().describe('List of statistics to retrieve (required for get_metric_statistics)'),
  }))
  .output(outputSchema)
  .handleInvocation(async (ctx) => {
    let client = clientFromContext(ctx);
    let { operation } = ctx.input;

    // ── List Alarms ──────────────────────────────────────────────────
    if (operation === 'list_alarms') {
      let params: Record<string, string> = {};

      if (ctx.input.alarmNames && ctx.input.alarmNames.length > 0) {
        Object.assign(params, flattenList('AlarmNames.member', ctx.input.alarmNames));
      }
      if (ctx.input.stateValue) {
        params['StateValue'] = ctx.input.stateValue;
      }
      if (ctx.input.maxRecords !== undefined) {
        params['MaxRecords'] = String(ctx.input.maxRecords);
      }
      if (ctx.input.nextToken) {
        params['NextToken'] = ctx.input.nextToken;
      }

      let response = await client.queryApi({
        service: CW_SERVICE,
        action: 'DescribeAlarms',
        version: CW_VERSION,
        params,
      });

      let xml = typeof response === 'string' ? response : String(response);
      let alarmBlocks = extractXmlBlocks(xml, 'member');
      let alarms = parseAlarmBlocks(alarmBlocks);
      let nextToken = extractXmlValue(xml, 'NextToken');

      return {
        output: {
          operation: 'list_alarms',
          alarms,
          nextToken: nextToken || undefined,
        },
        message: `Found **${alarms.length}** alarm(s)${nextToken ? ' (more available)' : ''}.`,
      };
    }

    // ── Describe Alarms ──────────────────────────────────────────────
    if (operation === 'describe_alarms') {
      if (!ctx.input.alarmNames || ctx.input.alarmNames.length === 0) {
        throw new Error('alarmNames is required for describe_alarms');
      }

      let params: Record<string, string> = {
        ...flattenList('AlarmNames.member', ctx.input.alarmNames),
      };

      let response = await client.queryApi({
        service: CW_SERVICE,
        action: 'DescribeAlarms',
        version: CW_VERSION,
        params,
      });

      let xml = typeof response === 'string' ? response : String(response);
      let alarmBlocks = extractXmlBlocks(xml, 'member');
      let alarms = parseAlarmBlocks(alarmBlocks);

      return {
        output: {
          operation: 'describe_alarms',
          alarms,
        },
        message: `Retrieved details for **${alarms.length}** alarm(s).`,
      };
    }

    // ── Create/Update Metric Alarm ───────────────────────────────────
    if (operation === 'create_update_alarm') {
      if (!ctx.input.alarmName) throw new Error('alarmName is required for create_update_alarm');
      if (!ctx.input.namespace) throw new Error('namespace is required for create_update_alarm');
      if (!ctx.input.metricName) throw new Error('metricName is required for create_update_alarm');
      if (!ctx.input.comparisonOperator) throw new Error('comparisonOperator is required for create_update_alarm');
      if (ctx.input.evaluationPeriods === undefined) throw new Error('evaluationPeriods is required for create_update_alarm');
      if (ctx.input.period === undefined) throw new Error('period is required for create_update_alarm');
      if (!ctx.input.statistic) throw new Error('statistic is required for create_update_alarm');
      if (ctx.input.threshold === undefined) throw new Error('threshold is required for create_update_alarm');

      let params: Record<string, string> = {
        AlarmName: ctx.input.alarmName,
        Namespace: ctx.input.namespace,
        MetricName: ctx.input.metricName,
        ComparisonOperator: ctx.input.comparisonOperator,
        EvaluationPeriods: String(ctx.input.evaluationPeriods),
        Period: String(ctx.input.period),
        Statistic: ctx.input.statistic,
        Threshold: String(ctx.input.threshold),
      };

      if (ctx.input.alarmDescription) {
        params['AlarmDescription'] = ctx.input.alarmDescription;
      }
      if (ctx.input.actionsEnabled !== undefined) {
        params['ActionsEnabled'] = String(ctx.input.actionsEnabled);
      }
      if (ctx.input.alarmActions && ctx.input.alarmActions.length > 0) {
        Object.assign(params, flattenList('AlarmActions.member', ctx.input.alarmActions));
      }
      if (ctx.input.dimensions && ctx.input.dimensions.length > 0) {
        Object.assign(params, flattenParams(
          'Dimensions.member',
          ctx.input.dimensions.map((d) => ({ Name: d.name, Value: d.value })),
        ));
      }

      await client.postQueryApi({
        service: CW_SERVICE,
        action: 'PutMetricAlarm',
        version: CW_VERSION,
        params,
      });

      return {
        output: {
          operation: 'create_update_alarm',
          alarm: {
            alarmName: ctx.input.alarmName,
            alarmDescription: ctx.input.alarmDescription,
            namespace: ctx.input.namespace,
            metricName: ctx.input.metricName,
            comparisonOperator: ctx.input.comparisonOperator,
            evaluationPeriods: ctx.input.evaluationPeriods,
            period: ctx.input.period,
            statistic: ctx.input.statistic,
            threshold: ctx.input.threshold,
            actionsEnabled: ctx.input.actionsEnabled ?? true,
            alarmActions: ctx.input.alarmActions,
            dimensions: ctx.input.dimensions,
          },
        },
        message: `Successfully created/updated alarm **${ctx.input.alarmName}** for metric **${ctx.input.namespace}/${ctx.input.metricName}**.`,
      };
    }

    // ── Delete Alarms ────────────────────────────────────────────────
    if (operation === 'delete_alarms') {
      if (!ctx.input.alarmNames || ctx.input.alarmNames.length === 0) {
        throw new Error('alarmNames is required for delete_alarms');
      }

      let params: Record<string, string> = {
        ...flattenList('AlarmNames.member', ctx.input.alarmNames),
      };

      await client.postQueryApi({
        service: CW_SERVICE,
        action: 'DeleteAlarms',
        version: CW_VERSION,
        params,
      });

      return {
        output: {
          operation: 'delete_alarms',
          deletedAlarms: ctx.input.alarmNames,
        },
        message: `Deleted **${ctx.input.alarmNames.length}** alarm(s): ${ctx.input.alarmNames.map((n) => `**${n}**`).join(', ')}.`,
      };
    }

    // ── Get Metric Statistics ────────────────────────────────────────
    if (operation === 'get_metric_statistics') {
      if (!ctx.input.namespace) throw new Error('namespace is required for get_metric_statistics');
      if (!ctx.input.metricName) throw new Error('metricName is required for get_metric_statistics');
      if (!ctx.input.startTime) throw new Error('startTime is required for get_metric_statistics');
      if (!ctx.input.endTime) throw new Error('endTime is required for get_metric_statistics');
      if (ctx.input.period === undefined) throw new Error('period is required for get_metric_statistics');
      if (!ctx.input.statistics || ctx.input.statistics.length === 0) {
        throw new Error('statistics is required for get_metric_statistics');
      }

      let params: Record<string, string> = {
        Namespace: ctx.input.namespace,
        MetricName: ctx.input.metricName,
        StartTime: ctx.input.startTime,
        EndTime: ctx.input.endTime,
        Period: String(ctx.input.period),
        ...flattenList('Statistics.member', ctx.input.statistics),
      };

      if (ctx.input.dimensions && ctx.input.dimensions.length > 0) {
        Object.assign(params, flattenParams(
          'Dimensions.member',
          ctx.input.dimensions.map((d) => ({ Name: d.name, Value: d.value })),
        ));
      }

      let response = await client.queryApi({
        service: CW_SERVICE,
        action: 'GetMetricStatistics',
        version: CW_VERSION,
        params,
      });

      let xml = typeof response === 'string' ? response : String(response);
      let label = extractXmlValue(xml, 'Label');
      let datapointBlocks = extractXmlBlocks(xml, 'member');
      let datapoints = datapointBlocks
        .map((block) => {
          let timestamp = extractXmlValue(block, 'Timestamp');
          if (!timestamp) return null;

          let sampleCountStr = extractXmlValue(block, 'SampleCount');
          let averageStr = extractXmlValue(block, 'Average');
          let sumStr = extractXmlValue(block, 'Sum');
          let minimumStr = extractXmlValue(block, 'Minimum');
          let maximumStr = extractXmlValue(block, 'Maximum');
          let unit = extractXmlValue(block, 'Unit');

          return {
            timestamp,
            sampleCount: sampleCountStr ? parseFloat(sampleCountStr) : undefined,
            average: averageStr ? parseFloat(averageStr) : undefined,
            sum: sumStr ? parseFloat(sumStr) : undefined,
            minimum: minimumStr ? parseFloat(minimumStr) : undefined,
            maximum: maximumStr ? parseFloat(maximumStr) : undefined,
            unit: unit || undefined,
          };
        })
        .filter((dp): dp is NonNullable<typeof dp> => dp !== null)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return {
        output: {
          operation: 'get_metric_statistics',
          label: label || undefined,
          datapoints,
        },
        message: `Retrieved **${datapoints.length}** datapoint(s) for metric **${ctx.input.namespace}/${ctx.input.metricName}**.`,
      };
    }

    // ── List Metrics ─────────────────────────────────────────────────
    if (operation === 'list_metrics') {
      let params: Record<string, string> = {};

      if (ctx.input.namespace) {
        params['Namespace'] = ctx.input.namespace;
      }
      if (ctx.input.metricName) {
        params['MetricName'] = ctx.input.metricName;
      }
      if (ctx.input.nextToken) {
        params['NextToken'] = ctx.input.nextToken;
      }
      if (ctx.input.dimensions && ctx.input.dimensions.length > 0) {
        Object.assign(params, flattenParams(
          'Dimensions.member',
          ctx.input.dimensions.map((d) => ({ Name: d.name, Value: d.value })),
        ));
      }

      let response = await client.queryApi({
        service: CW_SERVICE,
        action: 'ListMetrics',
        version: CW_VERSION,
        params,
      });

      let xml = typeof response === 'string' ? response : String(response);
      let metricBlocks = extractXmlBlocks(xml, 'member');
      let metrics = metricBlocks
        .map((block) => {
          let metricName = extractXmlValue(block, 'MetricName');
          let namespace = extractXmlValue(block, 'Namespace');
          if (!metricName || !namespace) return null;

          let dimensionBlocks = extractXmlBlocks(block, 'member');
          // Filter dimension blocks to only those containing Name and Value (not other member blocks)
          let dimensions = dimensionBlocks
            .map((dimBlock) => {
              let name = extractXmlValue(dimBlock, 'Name');
              let value = extractXmlValue(dimBlock, 'Value');
              if (name && value) return { name, value };
              return null;
            })
            .filter((d): d is NonNullable<typeof d> => d !== null);

          return {
            metricName,
            namespace,
            dimensions: dimensions.length > 0 ? dimensions : undefined,
          };
        })
        .filter((m): m is NonNullable<typeof m> => m !== null);

      let nextToken = extractXmlValue(xml, 'NextToken');

      let filterLabel = ctx.input.namespace ? ` in namespace **${ctx.input.namespace}**` : '';

      return {
        output: {
          operation: 'list_metrics',
          metrics,
          nextToken: nextToken || undefined,
        },
        message: `Found **${metrics.length}** metric(s)${filterLabel}${nextToken ? ' (more available)' : ''}.`,
      };
    }

    throw new Error(`Unknown operation: ${operation}`);
  }).build();

let parseAlarmBlocks = (blocks: string[]): z.infer<typeof alarmSchema>[] => {
  return blocks
    .map((block) => {
      let alarmName = extractXmlValue(block, 'AlarmName');
      if (!alarmName) return null;

      let periodStr = extractXmlValue(block, 'Period');
      let evalPeriodsStr = extractXmlValue(block, 'EvaluationPeriods');
      let thresholdStr = extractXmlValue(block, 'Threshold');
      let actionsEnabledStr = extractXmlValue(block, 'ActionsEnabled');

      let alarmActionValues = extractXmlValues(block, 'member');
      // Filter alarm actions to only ARN-like strings from AlarmActions block
      let alarmActionsBlock = extractXmlBlocks(block, 'AlarmActions');
      let alarmActions: string[] = [];
      if (alarmActionsBlock.length > 0) {
        alarmActions = extractXmlValues(alarmActionsBlock[0]!, 'member');
      }

      let dimensionsBlock = extractXmlBlocks(block, 'Dimensions');
      let dimensions: { name: string; value: string }[] = [];
      if (dimensionsBlock.length > 0) {
        let dimMemberBlocks = extractXmlBlocks(dimensionsBlock[0]!, 'member');
        dimensions = dimMemberBlocks
          .map((dimBlock) => {
            let name = extractXmlValue(dimBlock, 'Name');
            let value = extractXmlValue(dimBlock, 'Value');
            if (name && value) return { name, value };
            return null;
          })
          .filter((d): d is NonNullable<typeof d> => d !== null);
      }

      return {
        alarmName,
        alarmArn: extractXmlValue(block, 'AlarmArn') || undefined,
        alarmDescription: extractXmlValue(block, 'AlarmDescription') || undefined,
        stateValue: extractXmlValue(block, 'StateValue') || undefined,
        stateReason: extractXmlValue(block, 'StateReason') || undefined,
        stateUpdatedTimestamp: extractXmlValue(block, 'StateUpdatedTimestamp') || undefined,
        metricName: extractXmlValue(block, 'MetricName') || undefined,
        namespace: extractXmlValue(block, 'Namespace') || undefined,
        statistic: extractXmlValue(block, 'Statistic') || undefined,
        period: periodStr ? parseInt(periodStr, 10) : undefined,
        evaluationPeriods: evalPeriodsStr ? parseInt(evalPeriodsStr, 10) : undefined,
        threshold: thresholdStr ? parseFloat(thresholdStr) : undefined,
        comparisonOperator: extractXmlValue(block, 'ComparisonOperator') || undefined,
        actionsEnabled: actionsEnabledStr ? actionsEnabledStr === 'true' : undefined,
        alarmActions: alarmActions.length > 0 ? alarmActions : undefined,
        dimensions: dimensions.length > 0 ? dimensions : undefined,
      };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);
};
