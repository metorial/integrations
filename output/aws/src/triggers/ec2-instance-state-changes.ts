import { SlateTrigger, SlateDefaultPollingIntervalSeconds } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';
import { clientFromContext } from '../lib/helpers';
import { extractXmlValue, extractXmlBlocks } from '../lib/xml';

let instanceStateInputSchema = z.object({
  instanceId: z.string().describe('EC2 instance ID'),
  previousState: z.string().describe('Previous instance state'),
  currentState: z.string().describe('Current instance state'),
  instanceType: z.string().optional().describe('Instance type'),
  availabilityZone: z.string().optional().describe('Availability zone'),
  timestamp: z.string().describe('When the state change was detected'),
});

let instanceStateOutputSchema = z.object({
  instanceId: z.string().describe('EC2 instance ID'),
  previousState: z.string().describe('Previous instance state'),
  currentState: z.string().describe('Current instance state'),
  instanceType: z.string().optional().describe('Instance type'),
  availabilityZone: z.string().optional().describe('Availability zone'),
  timestamp: z.string().describe('When the state change was detected'),
});

export let ec2InstanceStateChangesTrigger = SlateTrigger.create(spec, {
  name: 'EC2 Instance State Changes',
  key: 'ec2_instance_state_changes',
  description: 'Polls for EC2 instance state changes. Detects when instances transition between pending, running, stopping, stopped, shutting-down, and terminated states.',
})
  .input(instanceStateInputSchema)
  .output(instanceStateOutputSchema)
  .polling({
    options: {
      intervalInSeconds: SlateDefaultPollingIntervalSeconds,
    },

    pollEvents: async (ctx) => {
      let client = clientFromContext(ctx);
      let previousStates: Record<string, string> = (ctx.state as Record<string, string>) ?? {};

      let response = await client.queryApi({
        service: 'ec2',
        action: 'DescribeInstances',
        version: '2016-11-15',
        params: {},
      });

      let xml = typeof response === 'string' ? response : String(response);
      let reservationSetBlock = extractXmlBlocks(xml, 'reservationSet')[0];

      let currentInstances: Array<{
        instanceId: string;
        state: string;
        instanceType: string | undefined;
        availabilityZone: string | undefined;
      }> = [];

      if (reservationSetBlock) {
        let reservations = extractXmlBlocks(reservationSetBlock, 'item');
        for (let reservation of reservations) {
          let instancesSetBlock = extractXmlBlocks(reservation, 'instancesSet')[0];
          if (instancesSetBlock) {
            let instanceItems = extractXmlBlocks(instancesSetBlock, 'item');
            for (let instanceBlock of instanceItems) {
              let instanceId = extractXmlValue(instanceBlock, 'instanceId');
              let stateBlock = extractXmlBlocks(instanceBlock, 'instanceState')[0];
              let stateName = stateBlock ? extractXmlValue(stateBlock, 'name') : undefined;
              let instanceType = extractXmlValue(instanceBlock, 'instanceType');
              let placementBlock = extractXmlBlocks(instanceBlock, 'placement')[0];
              let availabilityZone = placementBlock ? extractXmlValue(placementBlock, 'availabilityZone') : undefined;

              if (instanceId && stateName) {
                currentInstances.push({
                  instanceId,
                  state: stateName,
                  instanceType,
                  availabilityZone,
                });
              }
            }
          }
        }
      }

      let inputs: z.infer<typeof instanceStateInputSchema>[] = [];
      let newStates: Record<string, string> = {};
      let now = new Date().toISOString();

      for (let instance of currentInstances) {
        newStates[instance.instanceId] = instance.state;
        let previousState = previousStates[instance.instanceId];

        if (previousState !== undefined && previousState !== instance.state) {
          inputs.push({
            instanceId: instance.instanceId,
            previousState,
            currentState: instance.state,
            instanceType: instance.instanceType,
            availabilityZone: instance.availabilityZone,
            timestamp: now,
          });
        }
      }

      return {
        inputs,
        updatedState: newStates,
      };
    },

    handleEvent: async (ctx) => {
      let event = ctx.input;
      let eventType = `instance.${event.currentState}`;

      return {
        type: eventType,
        id: `${event.instanceId}-${event.currentState}-${event.timestamp}`,
        output: {
          instanceId: event.instanceId,
          previousState: event.previousState,
          currentState: event.currentState,
          instanceType: event.instanceType,
          availabilityZone: event.availabilityZone,
          timestamp: event.timestamp,
        },
      };
    },
  }).build();
