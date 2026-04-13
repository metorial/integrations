import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let deleteSubtask = SlateTool.create(spec, {
  name: 'Delete Subtask',
  key: 'delete_subtask',
  description: `Permanently delete a subtask from Project Bubble.`,
  tags: {
    destructive: true
  }
})
  .input(
    z.object({
      subtaskId: z.string().describe('ID of the subtask to delete')
    })
  )
  .output(
    z.object({
      deleted: z.boolean().describe('Whether the subtask was successfully deleted')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({
      token: ctx.auth.token,
      domain: ctx.config.domain
    });

    await client.deleteSubtask(ctx.input.subtaskId);

    return {
      output: { deleted: true },
      message: `Deleted subtask **${ctx.input.subtaskId}**.`
    };
  })
  .build();
