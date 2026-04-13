import { SlateTool } from 'slates';
import { FirefliesClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let listUsers = SlateTool.create(
  spec,
  {
    name: 'List Team Members',
    key: 'list_users',
    description: `Retrieve all team members with their profile information including name, email, role, connected integrations, transcript count, and minutes consumed.`,
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({}))
  .output(z.object({
    users: z.array(z.object({
      userId: z.string().describe('Unique user identifier'),
      email: z.string().nullable().describe('User email address'),
      name: z.string().nullable().describe('User full name'),
      numTranscripts: z.number().nullable().describe('Total number of transcripts'),
      recentMeeting: z.string().nullable().describe('Most recent meeting date'),
      minutesConsumed: z.number().nullable().describe('Transcription minutes consumed'),
      isAdmin: z.boolean().nullable().describe('Whether the user has admin privileges'),
      integrations: z.array(z.string()).nullable().describe('List of connected integrations'),
    })).describe('List of team members'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new FirefliesClient({ token: ctx.auth.token });
    let users = await client.getUsers();

    let mapped = (users || []).map((u: any) => ({
      userId: u.user_id,
      email: u.email ?? null,
      name: u.name ?? null,
      numTranscripts: u.num_transcripts ?? null,
      recentMeeting: u.recent_meeting ?? null,
      minutesConsumed: u.minutes_consumed ?? null,
      isAdmin: u.is_admin ?? null,
      integrations: u.integrations ?? null,
    }));

    return {
      output: { users: mapped },
      message: `Found **${mapped.length}** team member(s).`,
    };
  })
  .build();
