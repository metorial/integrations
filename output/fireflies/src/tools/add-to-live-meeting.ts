import { SlateTool } from 'slates';
import { FirefliesClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let addToLiveMeeting = SlateTool.create(
  spec,
  {
    name: 'Add Bot to Live Meeting',
    key: 'add_to_live_meeting',
    description: `Add the Fireflies.ai bot to an ongoing live meeting for automatic recording and transcription. Provide a valid meeting URL from supported platforms (Zoom, Google Meet, Microsoft Teams, etc.).`,
    constraints: [
      'Rate limited to 3 requests per 20 minutes.',
      'Meeting duration defaults to 60 minutes (min 15, max 120).',
    ],
  }
)
  .input(z.object({
    meetingLink: z.string().describe('Valid meeting URL (e.g. Zoom, Google Meet, Teams)'),
    title: z.string().optional().describe('Title for the meeting (max 256 characters)'),
    meetingPassword: z.string().optional().describe('Meeting password if required (max 32 characters)'),
    duration: z.number().optional().describe('Expected meeting duration in minutes (15-120, defaults to 60)'),
    language: z.string().optional().describe('Language code for transcription (e.g. "en", "es"). Defaults to English.'),
  }))
  .output(z.object({
    success: z.boolean().describe('Whether the bot was successfully added to the meeting'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new FirefliesClient({ token: ctx.auth.token });

    let result = await client.addToLiveMeeting({
      meetingLink: ctx.input.meetingLink,
      title: ctx.input.title,
      meetingPassword: ctx.input.meetingPassword,
      duration: ctx.input.duration,
      language: ctx.input.language,
    });

    return {
      output: { success: result?.success ?? false },
      message: result?.success
        ? `Fireflies bot added to meeting${ctx.input.title ? ` "${ctx.input.title}"` : ''}.`
        : 'Failed to add bot to meeting.',
    };
  })
  .build();
