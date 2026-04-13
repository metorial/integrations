import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let updateVideo = SlateTool.create(spec, {
  name: 'Update Video',
  key: 'update_video',
  description: `Update a YouTube video's metadata and/or status settings. Can update title, description, tags, category, privacy status, license, and other settings in a single call. Requires ownership of the video.`,
  tags: {
    destructive: false
  }
})
  .input(
    z.object({
      videoId: z.string().describe('ID of the video to update'),
      title: z.string().optional().describe('New title for the video'),
      description: z.string().optional().describe('New description for the video'),
      tags: z.array(z.string()).optional().describe('New tags for the video'),
      categoryId: z.string().optional().describe('New category ID for the video'),
      defaultLanguage: z.string().optional().describe('Default language (ISO 639-1 code)'),
      privacyStatus: z
        .enum(['private', 'public', 'unlisted'])
        .optional()
        .describe('Privacy status'),
      license: z.enum(['youtube', 'creativeCommon']).optional().describe('Video license type'),
      embeddable: z.boolean().optional().describe('Whether the video can be embedded'),
      publicStatsViewable: z
        .boolean()
        .optional()
        .describe('Whether public stats are viewable'),
      madeForKids: z.boolean().optional().describe('Whether the video is made for kids'),
      selfDeclaredMadeForKids: z
        .boolean()
        .optional()
        .describe('Self-declared made for kids status'),
      publishAt: z
        .string()
        .optional()
        .describe('Scheduled publish time (ISO 8601, only for private videos)')
    })
  )
  .output(
    z.object({
      videoId: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      privacyStatus: z.string().optional(),
      publishedAt: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let parts: string[] = [];
    let snippet: Record<string, any> | undefined;
    let status: Record<string, any> | undefined;

    if (
      ctx.input.title !== undefined ||
      ctx.input.description !== undefined ||
      ctx.input.tags !== undefined ||
      ctx.input.categoryId !== undefined ||
      ctx.input.defaultLanguage !== undefined
    ) {
      parts.push('snippet');
      snippet = {};
      if (ctx.input.title !== undefined) snippet.title = ctx.input.title;
      if (ctx.input.description !== undefined) snippet.description = ctx.input.description;
      if (ctx.input.tags !== undefined) snippet.tags = ctx.input.tags;
      if (ctx.input.categoryId !== undefined) snippet.categoryId = ctx.input.categoryId;
      if (ctx.input.defaultLanguage !== undefined)
        snippet.defaultLanguage = ctx.input.defaultLanguage;
    }

    if (
      ctx.input.privacyStatus !== undefined ||
      ctx.input.license !== undefined ||
      ctx.input.embeddable !== undefined ||
      ctx.input.publicStatsViewable !== undefined ||
      ctx.input.madeForKids !== undefined ||
      ctx.input.selfDeclaredMadeForKids !== undefined ||
      ctx.input.publishAt !== undefined
    ) {
      parts.push('status');
      status = {};
      if (ctx.input.privacyStatus !== undefined)
        status.privacyStatus = ctx.input.privacyStatus;
      if (ctx.input.license !== undefined) status.license = ctx.input.license;
      if (ctx.input.embeddable !== undefined) status.embeddable = ctx.input.embeddable;
      if (ctx.input.publicStatsViewable !== undefined)
        status.publicStatsViewable = ctx.input.publicStatsViewable;
      if (ctx.input.madeForKids !== undefined) status.madeForKids = ctx.input.madeForKids;
      if (ctx.input.selfDeclaredMadeForKids !== undefined)
        status.selfDeclaredMadeForKids = ctx.input.selfDeclaredMadeForKids;
      if (ctx.input.publishAt !== undefined) status.publishAt = ctx.input.publishAt;
    }

    if (parts.length === 0) {
      throw new Error('At least one field to update must be provided');
    }

    let video = await client.updateVideo({
      part: parts,
      videoId: ctx.input.videoId,
      snippet,
      status
    });

    return {
      output: {
        videoId: video.id,
        title: video.snippet?.title,
        description: video.snippet?.description,
        privacyStatus: video.status?.privacyStatus,
        publishedAt: video.snippet?.publishedAt
      },
      message: `Updated video "${video.snippet?.title || ctx.input.videoId}".`
    };
  })
  .build();
