import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let deleteClient = SlateTool.create(
  spec,
  {
    name: 'Delete Client',
    key: 'delete_client',
    description: `Permanently delete a client from your Nusii account. This action cannot be undone.`,
    tags: {
      destructive: true
    }
  }
)
  .input(z.object({
    clientId: z.string().describe('The ID of the client to delete')
  }))
  .output(z.object({
    success: z.boolean()
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token });
    await client.deleteClient(ctx.input.clientId);

    return {
      output: { success: true },
      message: `Deleted client with ID **${ctx.input.clientId}**.`
    };
  }).build();
