import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let mediaSourceSchema = z
  .object({
    sourceType: z
      .enum(['image_url', 'image_base64', 'video_id', 'multiple_image_urls'])
      .describe(
        'Type of media source. Use "image_url" for an image URL, "video_id" for a previously uploaded video, or "multiple_image_urls" for carousel pins.'
      ),
    url: z
      .string()
      .optional()
      .describe('URL of the image (required for image_url source type)'),
    contentType: z
      .enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
      .optional()
      .describe('MIME type of the image'),
    mediaId: z
      .string()
      .optional()
      .describe('Media ID for video pins (required for video_id source type)'),
    coverImageUrl: z.string().optional().describe('Cover image URL for video pins'),
    coverImageContentType: z.string().optional().describe('MIME type of the cover image'),
    items: z
      .array(
        z.object({
          title: z.string().optional().describe('Title for this carousel item'),
          description: z.string().optional().describe('Description for this carousel item'),
          link: z.string().optional().describe('Link URL for this carousel item'),
          sourceType: z.string().describe('Source type for the item image'),
          url: z.string().describe('URL of the item image'),
          contentType: z.string().optional().describe('MIME type of the item image')
        })
      )
      .optional()
      .describe(
        'Items for carousel/multi-image pins (required for multiple_image_urls source type)'
      )
  })
  .describe('Media source configuration for the pin');

export let createPin = SlateTool.create(spec, {
  name: 'Create Pin',
  key: 'create_pin',
  description: `Create a new Pin on Pinterest. Supports image pins (via URL), video pins, and carousel pins with multiple images. The pin will be saved to the specified board.`,
  instructions: [
    'For image pins, set sourceType to "image_url" and provide the image URL.',
    'For video pins, set sourceType to "video_id" and provide the mediaId from a previous video upload.',
    'For carousel pins, set sourceType to "multiple_image_urls" and provide items array with at least 2 images.'
  ],
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      boardId: z.string().describe('ID of the board to save the pin to'),
      boardSectionId: z
        .string()
        .optional()
        .describe('ID of the board section to save the pin to'),
      title: z.string().optional().describe('Title of the pin (max 100 characters)'),
      description: z
        .string()
        .optional()
        .describe('Description of the pin (max 800 characters)'),
      link: z.string().optional().describe('Destination link URL when the pin is clicked'),
      altText: z
        .string()
        .optional()
        .describe('Alt text for the pin image (max 500 characters)'),
      note: z.string().optional().describe('Pin note'),
      mediaSource: mediaSourceSchema
    })
  )
  .output(
    z.object({
      pinId: z.string().describe('ID of the created pin'),
      title: z.string().optional().describe('Title of the pin'),
      description: z.string().optional().describe('Description of the pin'),
      link: z.string().optional().describe('Destination link of the pin'),
      boardId: z.string().optional().describe('ID of the board'),
      createdAt: z.string().optional().describe('Creation timestamp'),
      creativeType: z
        .string()
        .optional()
        .describe('Type of pin creative (e.g., IMAGE, VIDEO, CAROUSEL)')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.createPin({
      boardId: ctx.input.boardId,
      boardSectionId: ctx.input.boardSectionId,
      title: ctx.input.title,
      description: ctx.input.description,
      link: ctx.input.link,
      altText: ctx.input.altText,
      note: ctx.input.note,
      mediaSource: ctx.input.mediaSource
    });

    return {
      output: {
        pinId: result.id,
        title: result.title,
        description: result.description,
        link: result.link,
        boardId: result.board_id,
        createdAt: result.created_at,
        creativeType: result.creative_type
      },
      message: `Created pin **${result.title || result.id}** on board ${result.board_id}.`
    };
  })
  .build();
