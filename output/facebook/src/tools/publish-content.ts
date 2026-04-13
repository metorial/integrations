import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let publishContent = SlateTool.create(
  spec,
  {
    name: 'Publish Content',
    key: 'publish_content',
    description: `Publish a post, photo, or video to a Facebook Page or user timeline.
For Pages, the tool automatically retrieves the Page access token. Supports scheduling posts for future publication.
Use \`contentType\` to specify whether you are posting text, a photo, or a video.`,
    instructions: [
      'For Page posts, provide the `pageId`. For user timeline posts, omit `pageId`.',
      'Photo publishing requires a publicly accessible `photoUrl`.',
      'Video publishing requires a publicly accessible `videoUrl`.',
      'To schedule a post, provide `scheduledPublishTime` as a Unix timestamp (must be 10 min to 6 months in the future).',
    ],
    tags: {
      destructive: false,
    },
  }
)
  .input(z.object({
    pageId: z.string().optional().describe('Page ID to publish to. Omit for user timeline.'),
    contentType: z.enum(['post', 'photo', 'video']).default('post').describe('Type of content to publish'),
    message: z.string().optional().describe('Text message for the post'),
    link: z.string().optional().describe('URL to share (for post type)'),
    photoUrl: z.string().optional().describe('Publicly accessible URL of the photo to publish'),
    videoUrl: z.string().optional().describe('Publicly accessible URL of the video to publish'),
    videoTitle: z.string().optional().describe('Title for the video'),
    scheduledPublishTime: z.number().optional().describe('Unix timestamp to schedule the post for future publication'),
  }))
  .output(z.object({
    postId: z.string().describe('ID of the created post or media'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({
      token: ctx.auth.token,
      apiVersion: ctx.config.apiVersion,
    });

    let targetId = ctx.input.pageId || 'me';
    let pageAccessToken: string | undefined;

    if (ctx.input.pageId) {
      pageAccessToken = await client.getPageAccessToken(ctx.input.pageId);
    }

    let result: { id: string; post_id?: string };

    if (ctx.input.contentType === 'photo') {
      result = await client.publishPhoto(
        targetId,
        { url: ctx.input.photoUrl, caption: ctx.input.message },
        pageAccessToken,
      );
    } else if (ctx.input.contentType === 'video') {
      result = await client.publishVideo(
        targetId,
        { file_url: ctx.input.videoUrl, description: ctx.input.message, title: ctx.input.videoTitle },
        pageAccessToken,
      );
    } else {
      result = await client.publishPost(
        targetId,
        {
          message: ctx.input.message,
          link: ctx.input.link,
          scheduledPublishTime: ctx.input.scheduledPublishTime,
        },
        pageAccessToken,
      );
    }

    let postId = result.post_id || result.id;

    return {
      output: { postId },
      message: ctx.input.scheduledPublishTime
        ? `Scheduled ${ctx.input.contentType} **${postId}** for future publication.`
        : `Published ${ctx.input.contentType} **${postId}** successfully.`,
    };
  }).build();
