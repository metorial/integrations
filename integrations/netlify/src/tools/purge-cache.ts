import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { netlifyServiceError } from '../lib/errors';
import { spec } from '../spec';
import { z } from 'zod';

export let purgeCache = SlateTool.create(spec, {
  name: 'Purge CDN Cache',
  key: 'purge_cache',
  description: `Purge cached content from Netlify's CDN for a site. Optionally limit the purge to specific cache tags.`
})
  .input(
    z.object({
      siteId: z.string().optional().describe('The site ID to purge the cache for'),
      siteSlug: z.string().optional().describe('The site slug to purge the cache for'),
      cacheTags: z
        .array(z.string())
        .optional()
        .describe('Cache tags to purge. Omit to purge the whole site cache.')
    })
  )
  .output(
    z.object({
      purged: z.boolean().describe('Whether the cache was successfully purged')
    })
  )
  .handleInvocation(async ctx => {
    if (!ctx.input.siteId && !ctx.input.siteSlug) {
      throw netlifyServiceError('siteId or siteSlug is required to purge cache');
    }

    let client = new Client({ token: ctx.auth.token });
    await client.purgeCache({
      siteId: ctx.input.siteId,
      siteSlug: ctx.input.siteSlug,
      cacheTags: ctx.input.cacheTags
    });

    return {
      output: { purged: true },
      message: `Purged CDN cache for site **${ctx.input.siteId || ctx.input.siteSlug}**.`
    };
  })
  .build();
