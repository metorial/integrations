import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let deleteJobResult = SlateTool.create(spec, {
  name: 'Delete Job Result',
  key: 'delete_job_result',
  description: `Delete a previously processed image result by its job ID. Removes the stored result from Deep Image servers.`,
  tags: {
    destructive: true,
    readOnly: false
  }
})
  .input(
    z.object({
      jobId: z.string().describe('Job hash/identifier of the result to delete')
    })
  )
  .output(
    z.object({
      deleted: z.boolean().describe('Whether the result was successfully deleted')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });
    await client.deleteResult(ctx.input.jobId);

    return {
      output: { deleted: true },
      message: `Job result \`${ctx.input.jobId}\` deleted successfully.`
    };
  })
  .build();
