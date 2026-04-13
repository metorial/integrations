import { SlateTool } from 'slates';
import { InstagramClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let publishMediaTool = SlateTool.create(spec, {
  name: 'Publish Media',
  key: 'publish_media',
  description: `Publish media to Instagram. Supports single image posts, Reels (video), Stories, and carousel albums. Publishing follows a two-step process internally: creating a media container and then publishing it. For carousels, provide multiple image/video URLs and they will be combined automatically.`,
  instructions: [
    'For carousel posts, provide the `carouselItems` array with image or video URLs.',
    'Video uploads (Reels) may take time to process. The tool will poll until the container is ready.',
    'Stories disappear after 24 hours.'
  ],
  constraints: [
    'Images must be JPEG format, max 8MB. Aspect ratio between 4:5 and 1.91:1.',
    'Videos must be MP4 or MOV, max 100MB, duration 3-90 seconds for Reels.',
    'Carousel albums require 2-10 items.'
  ]
})
  .input(
    z.object({
      mediaType: z
        .enum(['IMAGE', 'REELS', 'STORIES', 'CAROUSEL'])
        .describe('Type of media to publish'),
      imageUrl: z
        .string()
        .optional()
        .describe('Public URL of the image to publish (for IMAGE and STORIES types)'),
      videoUrl: z
        .string()
        .optional()
        .describe('Public URL of the video to publish (for REELS and STORIES types)'),
      caption: z
        .string()
        .optional()
        .describe('Caption for the post. Supports hashtags and mentions.'),
      locationId: z.string().optional().describe('Facebook Place ID for location tagging'),
      coverUrl: z.string().optional().describe('Custom cover image URL for Reels'),
      shareToFeed: z
        .boolean()
        .optional()
        .describe('Whether to share Reels to the main feed (default: true)'),
      userTags: z
        .array(
          z.object({
            username: z.string().describe('Instagram username to tag'),
            x: z.number().describe('Horizontal position (0.0-1.0)'),
            y: z.number().describe('Vertical position (0.0-1.0)')
          })
        )
        .optional()
        .describe('Users to tag in the image'),
      carouselItems: z
        .array(
          z.object({
            imageUrl: z.string().optional().describe('Image URL for this carousel item'),
            videoUrl: z.string().optional().describe('Video URL for this carousel item')
          })
        )
        .optional()
        .describe('Items for carousel posts (2-10 items)'),
      userId: z
        .string()
        .optional()
        .describe('Instagram user ID. Defaults to the authenticated user.')
    })
  )
  .output(
    z.object({
      mediaId: z.string().describe('ID of the published media'),
      permalink: z.string().optional().describe('Permanent link to the published media')
    })
  )
  .handleInvocation(async ctx => {
    let client = new InstagramClient({
      token: ctx.auth.token,
      apiVersion: ctx.config.apiVersion
    });

    let effectiveUserId = ctx.input.userId || ctx.auth.userId || 'me';
    let { mediaType } = ctx.input;

    let containerId: string;

    if (mediaType === 'CAROUSEL' && ctx.input.carouselItems) {
      ctx.progress('Creating carousel item containers...');

      let childIds: string[] = [];
      for (let item of ctx.input.carouselItems) {
        let childContainer = await client.createMediaContainer(effectiveUserId, {
          imageUrl: item.imageUrl,
          videoUrl: item.videoUrl,
          isCarouselItem: true,
          mediaType: item.videoUrl ? 'REELS' : undefined
        });
        childIds.push(childContainer.id);

        // Poll for video carousel items
        if (item.videoUrl) {
          await waitForContainer(client, childContainer.id);
        }
      }

      ctx.progress('Creating carousel container...');
      let carouselContainer = await client.createMediaContainer(effectiveUserId, {
        mediaType: 'CAROUSEL',
        caption: ctx.input.caption,
        locationId: ctx.input.locationId,
        children: childIds
      });
      containerId = carouselContainer.id;
    } else {
      ctx.progress('Creating media container...');
      let container = await client.createMediaContainer(effectiveUserId, {
        imageUrl: ctx.input.imageUrl,
        videoUrl: ctx.input.videoUrl,
        caption: ctx.input.caption,
        mediaType,
        locationId: ctx.input.locationId,
        userTags: ctx.input.userTags,
        coverUrl: ctx.input.coverUrl,
        shareToFeed: ctx.input.shareToFeed
      });
      containerId = container.id;

      if (mediaType === 'REELS' || ctx.input.videoUrl) {
        await waitForContainer(client, containerId);
      }
    }

    ctx.progress('Publishing media...');
    let published = await client.publishMedia(effectiveUserId, containerId);

    let permalink: string | undefined;
    try {
      let mediaDetails = await client.getMedia(published.id, 'id,permalink');
      permalink = mediaDetails.permalink;
    } catch {
      // Non-critical failure
    }

    return {
      output: {
        mediaId: published.id,
        permalink
      },
      message: `Published ${mediaType} post — media ID: **${published.id}**${permalink ? ` — [View on Instagram](${permalink})` : ''}`
    };
  })
  .build();

let waitForContainer = async (
  client: InstagramClient,
  containerId: string,
  maxAttempts = 30
) => {
  for (let i = 0; i < maxAttempts; i++) {
    let status = await client.getContainerStatus(containerId);
    if (status.status_code === 'FINISHED') return;
    if (status.status_code === 'ERROR') {
      throw new Error(`Media container failed: ${status.status || 'Unknown error'}`);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Media container processing timed out after 60 seconds');
};
