import { SlateTool } from 'slates';
import { SnapchatClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let managePixel = SlateTool.create(spec, {
  name: 'Manage Pixel',
  key: 'manage_pixel',
  description: `Create a new Snap Pixel or retrieve existing pixels for a Snapchat ad account. Snap Pixels are used to track website events for conversion tracking and audience building.`,
  tags: {
    readOnly: false
  }
})
  .input(
    z.object({
      adAccountId: z.string().describe('Ad account ID'),
      action: z.enum(['list', 'create']).describe('Action to perform'),
      name: z
        .string()
        .optional()
        .describe('Name for the new pixel (required when action is "create")')
    })
  )
  .output(
    z.object({
      pixels: z
        .array(
          z.object({
            pixelId: z.string().describe('Unique pixel ID'),
            name: z.string().optional().describe('Pixel name'),
            status: z.string().optional().describe('Pixel status'),
            createdAt: z.string().optional().describe('Creation timestamp'),
            updatedAt: z.string().optional().describe('Last update timestamp')
          })
        )
        .describe('List of pixels (single element for create)')
    })
  )
  .handleInvocation(async ctx => {
    let client = new SnapchatClient(ctx.auth.token);

    if (ctx.input.action === 'create') {
      let result = await client.createPixel(ctx.input.adAccountId, {
        name: ctx.input.name
      });

      return {
        output: {
          pixels: [
            {
              pixelId: result.id,
              name: result.name,
              status: result.status,
              createdAt: result.created_at,
              updatedAt: result.updated_at
            }
          ]
        },
        message: `Created Snap Pixel **${result.name}** (${result.id}).`
      };
    }

    let results = await client.listPixels(ctx.input.adAccountId);
    let pixels = results.map((p: any) => ({
      pixelId: p.id,
      name: p.name,
      status: p.status,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    return {
      output: { pixels },
      message: `Found **${pixels.length}** Snap Pixel(s).`
    };
  })
  .build();
