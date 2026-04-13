import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let deletePin = SlateTool.create(spec, {
  name: 'Delete Pin',
  key: 'delete_pin',
  description: `Permanently delete a Pin. This action cannot be undone.`,
  tags: {
    destructive: true,
    readOnly: false
  }
})
  .input(
    z.object({
      pinId: z.string().describe('ID of the pin to delete')
    })
  )
  .output(
    z.object({
      deleted: z.boolean().describe('Whether the pin was successfully deleted')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    await client.deletePin(ctx.input.pinId);

    return {
      output: {
        deleted: true
      },
      message: `Deleted pin **${ctx.input.pinId}**.`
    };
  })
  .build();
