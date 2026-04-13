import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let purgeCache = SlateTool.create(spec, {
  name: 'Purge CDN Cache',
  key: 'purge_cache',
  description: `Purge all cached content from Netlify's CDN for a site. Forces the CDN to re-fetch content from the origin on the next request.`,
  constraints: ['Purging affects the entire site cache; individual paths cannot be targeted.']
})
  .input(
    z.object({
      siteId: z.string().describe('The site ID to purge the cache for')
    })
  )
  .output(
    z.object({
      purged: z.boolean().describe('Whether the cache was successfully purged')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });
    await client.purgeCache(ctx.input.siteId);

    return {
      output: { purged: true },
      message: `Purged CDN cache for site **${ctx.input.siteId}**.`
    };
  })
  .build();
