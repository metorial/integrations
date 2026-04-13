import { SlateTool } from 'slates';
import { ClickHouseClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let getQueryEndpoint = SlateTool.create(spec, {
  name: 'Get Query Endpoint',
  key: 'get_query_endpoint',
  description: `Retrieve the query endpoint configuration for a service. Query endpoints expose saved SQL queries as HTTP API endpoints.`,
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
        .describe('Query endpoint configuration details')
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let config = await client.getQueryEndpoint(ctx.input.serviceId);

    return {
      output: { endpointConfig: config },
      message: `Retrieved query endpoint configuration for service ${ctx.input.serviceId}.`
    };
  })
  .build();

export let upsertQueryEndpoint = SlateTool.create(spec, {
  name: 'Upsert Query Endpoint',
  key: 'upsert_query_endpoint',
  description: `Create or update a query endpoint for a service. Query endpoints allow creating API endpoints directly from saved SQL queries. Supports parameterized queries, custom API key access, and CORS policies.`
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service'),
      endpointSettings: z
        .record(z.string(), z.any())
        .describe('Query endpoint configuration to create or update')
    })
  )
  .output(
    z.object({
      endpointConfig: z
        .record(z.string(), z.any())
        .describe('Created or updated endpoint configuration')
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let result = await client.upsertQueryEndpoint(
      ctx.input.serviceId,
      ctx.input.endpointSettings
    );

    return {
      output: { endpointConfig: result },
      message: `Query endpoint configured for service ${ctx.input.serviceId}.`
    };
  })
  .build();

export let deleteQueryEndpoint = SlateTool.create(spec, {
  name: 'Delete Query Endpoint',
  key: 'delete_query_endpoint',
  description: `Delete the query endpoint configuration for a service.`,
  tags: {
    destructive: true
  }
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service')
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

    await client.deleteQueryEndpoint(ctx.input.serviceId);

    return {
      output: { deleted: true },
      message: `Query endpoint deleted for service ${ctx.input.serviceId}.`
    };
  })
  .build();
