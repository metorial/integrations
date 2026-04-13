import { SlateTool } from 'slates';
import { spec } from '../spec';
import { createClient } from '../lib/helpers';
import { z } from 'zod';

export let getContentVersions = SlateTool.create(spec, {
  name: 'Get Content Versions',
  key: 'get_content_versions',
  description: `Retrieve the version history of a Confluence page or blog post. Shows who made changes, when, and their version messages.`,
  tags: { readOnly: true }
})
  .input(
    z.object({
      contentId: z.string().describe('The content ID (page or blog post)'),
      limit: z
        .number()
        .optional()
        .default(10)
        .describe('Maximum number of versions to return'),
      start: z.number().optional().describe('Offset for pagination')
    })
  )
  .output(
    z.object({
      versions: z.array(
        z.object({
          versionNumber: z.number(),
          message: z.string().optional(),
          when: z.string().optional(),
          authorDisplayName: z.string().optional(),
          authorAccountId: z.string().optional(),
          minorEdit: z.boolean().optional()
        })
      )
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx.auth, ctx.config);
    let response = await client.getContentVersions(ctx.input.contentId, {
      limit: ctx.input.limit,
      start: ctx.input.start
    });

    let versions = response.results.map((v: any) => ({
      versionNumber: v.number,
      message: v.message,
      when: v.when,
      authorDisplayName: v.by?.displayName,
      authorAccountId: v.by?.accountId,
      minorEdit: v.minorEdit
    }));

    return {
      output: { versions },
      message: `Found **${versions.length}** versions for content ${ctx.input.contentId}`
    };
  })
  .build();
