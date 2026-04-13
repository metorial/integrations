import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let createApplication = SlateTool.create(
  spec,
  {
    name: 'Create Application',
    key: 'create_application',
    description: `Create a new consumer application in Svix. Applications represent your customers and are the target for webhook messages. Assign a custom UID (e.g., your internal customer ID) to enable stateless usage without storing Svix IDs.`,
    tags: {
      destructive: false,
    },
  }
)
  .input(z.object({
    name: z.string().describe('Display name for the application'),
    uid: z.string().optional().describe('Custom unique identifier (e.g., your internal customer ID). Can be used interchangeably with the Svix ID.'),
    rateLimit: z.number().optional().describe('Rate limit for message delivery to this application'),
    metadata: z.record(z.string(), z.string()).optional().describe('Key-value metadata for the application'),
  }))
  .output(z.object({
    applicationId: z.string().describe('Svix application ID'),
    name: z.string().describe('Name of the application'),
    uid: z.string().optional().describe('Custom UID of the application'),
    createdAt: z.string().describe('When the application was created'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({
      token: ctx.auth.token,
      region: ctx.config.region || 'us',
    });

    ctx.progress('Creating application...');
    let app = await client.createApplication({
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
        createdAt: app.createdAt,
      },
      message: `Created application **${app.name}**${app.uid ? ` (uid: ${app.uid})` : ''} with ID \`${app.id}\`.`,
    };
  }).build();
