import { SlateTool } from 'slates';
import { ClickHouseClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let getPrivateEndpointConfig = SlateTool.create(spec, {
  name: 'Get Private Endpoint Config',
  key: 'get_private_endpoint_config',
  description: `Retrieve the private endpoint configuration for a specific service. Shows available private endpoint service IDs for connecting from your cloud VPC.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service')
    })
  )
  .output(
    z.object({
      endpointConfig: z
        .record(z.string(), z.any())
        .describe('Private endpoint configuration details')
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let config = await client.getPrivateEndpointConfig(ctx.input.serviceId);

    return {
      output: { endpointConfig: config },
      message: `Retrieved private endpoint configuration for service ${ctx.input.serviceId}.`
    };
  })
  .build();

export let listReversePrivateEndpoints = SlateTool.create(spec, {
  name: 'List Reverse Private Endpoints',
  key: 'list_reverse_private_endpoints',
  description: `List all reverse private endpoints for the organization. Reverse private endpoints allow ClickHouse Cloud to securely initiate connections to private customer resources.`,
  tags: {
    readOnly: true
  }
})
  .input(z.object({}))
  .output(
    z.object({
      reversePrivateEndpoints: z.array(
        z.object({
          endpointId: z.string(),
          name: z.string().optional(),
          region: z.string().optional(),
          state: z.string().optional()
        })
      )
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let endpoints = await client.listReversePrivateEndpoints();
    let items = Array.isArray(endpoints) ? endpoints : [];

    return {
      output: {
        reversePrivateEndpoints: items.map((e: any) => ({
          endpointId: e.id,
          name: e.name,
          region: e.region,
          state: e.state
        }))
      },
      message: `Found **${items.length}** reverse private endpoints.`
    };
  })
  .build();

export let createReversePrivateEndpoint = SlateTool.create(spec, {
  name: 'Create Reverse Private Endpoint',
  key: 'create_reverse_private_endpoint',
  description: `Create a new reverse private endpoint for the organization, enabling ClickHouse Cloud to securely connect to your private resources.`
})
  .input(
    z.object({
      name: z.string().describe('Name for the reverse private endpoint'),
      region: z.string().describe('Cloud region for the endpoint')
    })
  )
  .output(
    z.object({
      endpointId: z.string(),
      name: z.string().optional(),
      region: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let result = await client.createReversePrivateEndpoint({
      name: ctx.input.name,
      region: ctx.input.region
    });

    return {
      output: {
        endpointId: result.id,
        name: result.name,
        region: result.region
      },
      message: `Reverse private endpoint **${result.name}** created in ${result.region}.`
    };
  })
  .build();

export let deleteReversePrivateEndpoint = SlateTool.create(spec, {
  name: 'Delete Reverse Private Endpoint',
  key: 'delete_reverse_private_endpoint',
  description: `Delete a reverse private endpoint from the organization.`,
  tags: {
    destructive: true
  }
})
  .input(
    z.object({
      endpointId: z.string().describe('ID of the reverse private endpoint to delete')
    })
  )
  .output(
    z.object({
      deleted: z.boolean()
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    await client.deleteReversePrivateEndpoint(ctx.input.endpointId);

    return {
      output: { deleted: true },
      message: `Reverse private endpoint **${ctx.input.endpointId}** deleted.`
    };
  })
  .build();
