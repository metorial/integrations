import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let updateApplication = SlateTool.create(
  spec,
  {
    name: 'Update Application',
    key: 'update_application',
    description: `Update an existing consumer application's name, UID, rate limit, or metadata. Provide the application ID or UID to identify which application to update.`,
    tags: {
      destructive: false,
    },
  }
)
  .input(z.object({
    applicationId: z.string().describe('Application ID or UID to update'),
    name: z.string().describe('Updated display name for the application'),
    uid: z.string().optional().describe('Updated custom UID for the application'),
    rateLimit: z.number().optional().describe('Updated rate limit'),
    metadata: z.record(z.string(), z.string()).optional().describe('Updated key-value metadata'),
  }))
  .output(z.object({
    applicationId: z.string().describe('Svix application ID'),
    name: z.string().describe('Updated name'),
    uid: z.string().optional().describe('Updated UID'),
    updatedAt: z.string().describe('When the application was updated'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({
      token: ctx.auth.token,
      region: ctx.config.region || 'us',
    });

    ctx.progress('Updating application...');
    let app = await client.updateApplication(ctx.input.applicationId, {
      name: ctx.input.name,
      uid: ctx.input.uid,
      rateLimit: ctx.input.rateLimit,
      metadata: ctx.input.metadata,
    });

    return {
      output: {
        applicationId: app.id,
        name: app.name,
        uid: app.uid,
        updatedAt: app.updatedAt,
      },
      message: `Updated application **${app.name}** (\`${app.id}\`).`,
    };
  }).build();
