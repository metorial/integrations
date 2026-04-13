import { SlateTool } from 'slates';
import { FirefliesClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let userSchema = z.object({
  userId: z.string().describe('Unique user identifier'),
  email: z.string().nullable().describe('User email address'),
  name: z.string().nullable().describe('User full name'),
  numTranscripts: z.number().nullable().describe('Total number of transcripts'),
  recentMeeting: z.string().nullable().describe('Most recent meeting date'),
  minutesConsumed: z.number().nullable().describe('Transcription minutes consumed'),
  isAdmin: z.boolean().nullable().describe('Whether the user has admin privileges'),
  integrations: z.array(z.string()).nullable().describe('List of connected integrations')
});

export let getUser = SlateTool.create(spec, {
  name: 'Get User',
  key: 'get_user',
  description: `Retrieve information about a specific user or the authenticated user. Returns user profile data including name, email, role, integrations, transcript count, and minutes consumed.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      userId: z
        .string()
        .optional()
        .describe('User ID to look up. If omitted, returns the authenticated user.')
    })
  )
  .output(userSchema)
  .handleInvocation(async ctx => {
    let client = new FirefliesClient({ token: ctx.auth.token });
    let user = await client.getUser(ctx.input.userId);

    let output = {
      userId: user.user_id,
      email: user.email ?? null,
      name: user.name ?? null,
      numTranscripts: user.num_transcripts ?? null,
      recentMeeting: user.recent_meeting ?? null,
      minutesConsumed: user.minutes_consumed ?? null,
      isAdmin: user.is_admin ?? null,
      integrations: user.integrations ?? null
    };

    return {
      output,
      message: `Retrieved user **${output.name ?? output.email ?? output.userId}**${output.isAdmin ? ' (admin)' : ''}.`
    };
  })
  .build();
