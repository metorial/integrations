import { SlateTool } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';
import { createClient } from '../lib/helpers';

export let deleteContact = SlateTool.create(
  spec,
  {
    name: 'Delete Contact',
    key: 'delete_contact',
    description: `Delete a contact from Follow Up Boss by their person ID. This action is permanent.`,
    tags: {
      destructive: true,
    },
  }
)
  .input(z.object({
    personId: z.number().describe('ID of the contact to delete'),
  }))
  .output(z.object({
    success: z.boolean(),
  }))
  .handleInvocation(async (ctx) => {
    let client = createClient(ctx);
    await client.deletePerson(ctx.input.personId);

    return {
      output: { success: true },
      message: `Deleted contact with ID **${ctx.input.personId}**.`,
    };
  }).build();
