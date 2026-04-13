import { SlateTool } from 'slates';
import { FirefliesClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let listChannels = SlateTool.create(spec, {
  name: 'List Channels',
  key: 'list_channels',
  description: `Retrieve all channels accessible to the authenticated user. Returns public team channels and private channels where the user is a member, including channel metadata and member lists.`,
  tags: {
    readOnly: true
  }
})
  .input(z.object({}))
  .output(
    z.object({
      channels: z
        .array(
          z.object({
            channelId: z.string().describe('Unique channel identifier'),
            title: z.string().nullable().describe('Channel title'),
            isPrivate: z.boolean().nullable().describe('Whether the channel is private'),
            createdBy: z.string().nullable().describe('User who created the channel'),
            createdAt: z.string().nullable().describe('Channel creation date'),
            updatedAt: z.string().nullable().describe('Last update date'),
            members: z
              .array(
                z.object({
                  userId: z.string().nullable().describe('Member user ID'),
                  email: z.string().nullable().describe('Member email'),
                  name: z.string().nullable().describe('Member name')
                })
              )
              .nullable()
              .describe('Channel members')
          })
        )
        .describe('List of accessible channels')
    })
  )
  .handleInvocation(async ctx => {
    let client = new FirefliesClient({ token: ctx.auth.token });
    let channels = await client.getChannels();

    let mapped = (channels || []).map((c: any) => ({
      channelId: c.id,
      title: c.title ?? null,
      isPrivate: c.is_private ?? null,
      createdBy: c.created_by ?? null,
      createdAt: c.created_at ?? null,
      updatedAt: c.updated_at ?? null,
      members:
        c.members?.map((m: any) => ({
          userId: m.user_id ?? null,
          email: m.email ?? null,
          name: m.name ?? null
        })) ?? null
    }));

    return {
      output: { channels: mapped },
      message: `Found **${mapped.length}** channel(s).`
    };
  })
  .build();
