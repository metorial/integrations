import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let updateChannel = SlateTool.create(spec, {
  name: 'Update Channel',
  key: 'update_channel',
  description: `Update branding settings for a YouTube channel. Can modify the channel's title, description, keywords, unsubscribed trailer, and country. Requires channel ownership.`,
  tags: {
    destructive: false
  }
})
  .input(
    z.object({
      channelId: z.string().describe('ID of the channel to update'),
      title: z.string().optional().describe('Channel title'),
      description: z.string().optional().describe('Channel description'),
      keywords: z.string().optional().describe('Channel keywords (space-separated)'),
      unsubscribedTrailer: z
        .string()
        .optional()
        .describe('Video ID to use as the channel trailer for unsubscribed viewers'),
      country: z
        .string()
        .optional()
        .describe('Country the channel is associated with (ISO 3166-1 alpha-2)')
    })
  )
  .output(
    z.object({
      channelId: z.string(),
      title: z.string().optional(),
      description: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let channelSettings: Record<string, any> = {};
    if (ctx.input.title !== undefined) channelSettings.title = ctx.input.title;
    if (ctx.input.description !== undefined)
      channelSettings.description = ctx.input.description;
    if (ctx.input.keywords !== undefined) channelSettings.keywords = ctx.input.keywords;
    if (ctx.input.unsubscribedTrailer !== undefined)
      channelSettings.unsubscribedTrailer = ctx.input.unsubscribedTrailer;
    if (ctx.input.country !== undefined) channelSettings.country = ctx.input.country;

    let channel = await client.updateChannel({
      part: ['brandingSettings'],
      channelId: ctx.input.channelId,
      brandingSettings: {
        channel: channelSettings
      }
    });

    return {
      output: {
        channelId: channel.id,
        title: channel.brandingSettings?.channel?.title,
        description: channel.brandingSettings?.channel?.description
      },
      message: `Updated channel "${channel.brandingSettings?.channel?.title || ctx.input.channelId}".`
    };
  })
  .build();
