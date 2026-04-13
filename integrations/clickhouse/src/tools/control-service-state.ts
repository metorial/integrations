import { SlateTool } from 'slates';
import { ClickHouseClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let controlServiceState = SlateTool.create(
  spec,
  {
    name: 'Control Service State',
    key: 'control_service_state',
    description: `Start or stop a ClickHouse service. A service must be stopped before it can be deleted. Note: **start** does not wake idle services — to wake an idle service, ping it directly at its endpoint.`,
    constraints: [
      'The start command does not wake idle services. Ping the service endpoint directly to wake it.',
      'A service must be stopped before it can be deleted.',
    ],
  }
)
  .input(z.object({
    serviceId: z.string().describe('ID of the service to start or stop'),
    command: z.enum(['start', 'stop']).describe('The state transition command'),
  }))
  .output(z.object({
    serviceId: z.string(),
    name: z.string().optional(),
    state: z.string().optional().describe('New transitional state of the service'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId,
    });

    let result = await client.updateServiceState(ctx.input.serviceId, ctx.input.command);

    return {
      output: {
        serviceId: result.id || ctx.input.serviceId,
        name: result.name,
        state: result.state,
      },
      message: `Service **${result.name || ctx.input.serviceId}** is now **${result.state}** (command: ${ctx.input.command}).`,
    };
  })
  .build();
