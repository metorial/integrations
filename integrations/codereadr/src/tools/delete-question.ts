import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let deleteQuestion = SlateTool.create(spec, {
  name: 'Delete Question',
  key: 'delete_question',
  description: `Delete one or more data collection questions from your CodeREADr account.`,
  tags: {
    destructive: true
  }
})
  .input(
    z.object({
      questionId: z
        .string()
        .describe(
          'Question ID to delete. Use comma-separated IDs for multiple, or "all" to delete all.'
        )
    })
  )
  .output(
    z.object({
      questionId: z.string().describe('ID(s) of the deleted question(s)')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client(ctx.auth.token);
    await client.deleteQuestion(ctx.input.questionId);

    return {
      output: { questionId: ctx.input.questionId },
      message: `Deleted question(s) **${ctx.input.questionId}**.`
    };
  })
  .build();
