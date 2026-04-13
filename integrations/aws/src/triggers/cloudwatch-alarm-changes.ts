import { SlateTrigger, SlateDefaultPollingIntervalSeconds } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';
import { clientFromContext, flattenList } from '../lib/helpers';
import { extractXmlValue, extractXmlBlocks } from '../lib/xml';

let alarmInputSchema = z.object({
  alarmName: z.string().describe('Name of the alarm'),
  alarmArn: z.string().describe('ARN of the alarm'),
  stateValue: z.string().describe('Current state: OK, ALARM, or INSUFFICIENT_DATA'),
  previousStateValue: z.string().optional().describe('Previous alarm state'),
  stateReason: z.string().optional().describe('Reason for the state change'),
  stateUpdatedTimestamp: z.string().describe('When the state last changed'),
  metricName: z.string().optional().describe('Metric name'),
  namespace: z.string().optional().describe('Metric namespace'),
  threshold: z.number().optional().describe('Alarm threshold'),
  comparisonOperator: z.string().optional().describe('Comparison operator')
});

let alarmOutputSchema = z.object({
  alarmName: z.string().describe('Name of the alarm'),
  alarmArn: z.string().describe('ARN of the alarm'),
  stateValue: z.string().describe('Current state: OK, ALARM, or INSUFFICIENT_DATA'),
  previousStateValue: z.string().optional().describe('Previous alarm state'),
  stateReason: z.string().optional().describe('Reason for the state change'),
  stateUpdatedTimestamp: z.string().describe('When the state last changed'),
  metricName: z.string().optional().describe('Metric name'),
  namespace: z.string().optional().describe('Metric namespace'),
  threshold: z.number().optional().describe('Alarm threshold'),
  comparisonOperator: z.string().optional().describe('Comparison operator')
});

export let cloudwatchAlarmChangesTrigger = SlateTrigger.create(spec, {
  name: 'CloudWatch Alarm Changes',
  key: 'cloudwatch_alarm_changes',
  description:
    'Polls for CloudWatch alarm state changes. Detects when alarms transition between OK, ALARM, and INSUFFICIENT_DATA states.'
})
  .input(alarmInputSchema)
  .output(alarmOutputSchema)
  .polling({
    options: {
      intervalInSeconds: SlateDefaultPollingIntervalSeconds
    },

    pollEvents: async ctx => {
      let client = clientFromContext(ctx);
      let previousAlarmStates: Record<string, string> =
        (ctx.state as Record<string, string>) ?? {};

      let response = await client.queryApi({
        service: 'monitoring',
        action: 'DescribeAlarms',
        version: '2010-08-01',
        params: { MaxRecords: '100' }
      });

      let xml = typeof response === 'string' ? response : String(response);
      let memberBlocks = extractXmlBlocks(xml, 'member');

      let currentAlarms: Array<{
        alarmName: string;
        alarmArn: string;
        stateValue: string;
        stateReason: string | undefined;
        stateUpdatedTimestamp: string;
        metricName: string | undefined;
        namespace: string | undefined;
        threshold: number | undefined;
        comparisonOperator: string | undefined;
      }> = [];

      for (let block of memberBlocks) {
        let alarmName = extractXmlValue(block, 'AlarmName');
        let alarmArn = extractXmlValue(block, 'AlarmArn');
        let stateValue = extractXmlValue(block, 'StateValue');
        let stateUpdatedTimestamp = extractXmlValue(block, 'StateUpdatedTimestamp');

        if (alarmName && alarmArn && stateValue && stateUpdatedTimestamp) {
          let thresholdStr = extractXmlValue(block, 'Threshold');
          currentAlarms.push({
            alarmName,
            alarmArn,
            stateValue,
            stateReason: extractXmlValue(block, 'StateReason'),
            stateUpdatedTimestamp,
            metricName: extractXmlValue(block, 'MetricName'),
            namespace: extractXmlValue(block, 'Namespace'),
            threshold: thresholdStr ? parseFloat(thresholdStr) : undefined,
            comparisonOperator: extractXmlValue(block, 'ComparisonOperator')
          });
        }
      }

      let inputs: z.infer<typeof alarmInputSchema>[] = [];
      let newStates: Record<string, string> = {};

      for (let alarm of currentAlarms) {
        newStates[alarm.alarmName] = alarm.stateValue;
        let previousState = previousAlarmStates[alarm.alarmName];

        if (previousState !== undefined && previousState !== alarm.stateValue) {
          inputs.push({
            alarmName: alarm.alarmName,
            alarmArn: alarm.alarmArn,
            stateValue: alarm.stateValue,
            previousStateValue: previousState,
            stateReason: alarm.stateReason,
            stateUpdatedTimestamp: alarm.stateUpdatedTimestamp,
            metricName: alarm.metricName,
            namespace: alarm.namespace,
            threshold: alarm.threshold,
            comparisonOperator: alarm.comparisonOperator
          });
        }
      }

      return {
        inputs,
        updatedState: newStates
      };
    },

    handleEvent: async ctx => {
      let alarm = ctx.input;
      let eventType =
        alarm.stateValue === 'ALARM'
          ? 'alarm.triggered'
          : alarm.stateValue === 'OK'
            ? 'alarm.resolved'
            : 'alarm.insufficient_data';

      return {
        type: eventType,
        id: `${alarm.alarmName}-${alarm.stateUpdatedTimestamp}`,
        output: {
          alarmName: alarm.alarmName,
          alarmArn: alarm.alarmArn,
          stateValue: alarm.stateValue,
          previousStateValue: alarm.previousStateValue,
          stateReason: alarm.stateReason,
          stateUpdatedTimestamp: alarm.stateUpdatedTimestamp,
          metricName: alarm.metricName,
          namespace: alarm.namespace,
          threshold: alarm.threshold,
          comparisonOperator: alarm.comparisonOperator
        }
      };
    }
  })
  .build();
