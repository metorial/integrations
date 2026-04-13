import { SlateTool } from 'slates';
import { GistClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let deleteContact = SlateTool.create(
  spec,
  {
    name: 'Delete Contact',
    key: 'delete_contact',
    description: `Permanently delete a contact from Gist by their ID. This action cannot be undone.`,
    tags: { destructive: true },
  }
)
  .input(z.object({
    contactId: z.string().describe('ID of the contact to delete'),
  }))
  .output(z.object({
    deleted: z.boolean().describe('Whether the contact was successfully deleted'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new GistClient({ token: ctx.auth.token });
    await client.deleteContact(ctx.input.contactId);

    return {
      output: { deleted: true },
      message: `Contact **${ctx.input.contactId}** has been deleted.`,
    };
  }).build();
