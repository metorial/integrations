import { SlateTool } from 'slates';
import { BookingmoodClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let deleteContact = SlateTool.create(spec, {
  name: 'Delete Contact',
  key: 'delete_contact',
  description: `Deletes a contact by its ID. This action is irreversible.`,
  tags: {
    destructive: true,
    readOnly: false
  }
})
  .input(
    z.object({
      contactId: z.string().describe('UUID of the contact to delete')
    })
  )
  .output(
    z.object({
      success: z.boolean().describe('Whether the deletion was successful')
    })
  )
  .handleInvocation(async ctx => {
    let client = new BookingmoodClient(ctx.auth.token);
    await client.deleteContact(ctx.input.contactId);

    return {
      output: { success: true },
      message: `Contact **${ctx.input.contactId}** deleted successfully.`
    };
  })
  .build();
