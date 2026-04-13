import { SlateTool } from 'slates';
import { FirefliesClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let listActiveMeetings = SlateTool.create(
  spec,
  {
    name: 'List Active Meetings',
    key: 'list_active_meetings',
    description: `Retrieve meetings currently in progress. Returns real-time information including meeting title, organizer, link, start time, and state (active or paused). Regular users can only see their own meetings; admins can query any team member's active meetings.`,
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({
    email: z.string().optional().describe('Filter by user email. Defaults to authenticated user. Admins can query other team members.'),
    states: z.array(z.enum(['active', 'paused'])).optional().describe('Filter by meeting states'),
  }))
  .output(z.object({
    meetings: z.array(z.object({
      meetingId: z.string().describe('Meeting identifier'),
      title: z.string().nullable().describe('Meeting title'),
      organizerEmail: z.string().nullable().describe('Organizer email'),
      meetingLink: z.string().nullable().describe('URL to join the meeting'),
      startTime: z.string().nullable().describe('Meeting start time'),
      endTime: z.string().nullable().describe('Meeting end time'),
      privacy: z.string().nullable().describe('Privacy level'),
      state: z.string().nullable().describe('Meeting state (active or paused)'),
    })).describe('List of active meetings'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new FirefliesClient({ token: ctx.auth.token });

    let meetings = await client.getActiveMeetings({
      email: ctx.input.email,
      states: ctx.input.states,
    });

    let mapped = (meetings || []).map((m: any) => ({
      meetingId: m.id,
      title: m.title ?? null,
      organizerEmail: m.organizer_email ?? null,
      meetingLink: m.meeting_link ?? null,
      startTime: m.start_time ?? null,
      endTime: m.end_time ?? null,
      privacy: m.privacy ?? null,
      state: m.state ?? null,
    }));

    return {
      output: { meetings: mapped },
      message: `Found **${mapped.length}** active meeting(s).`,
    };
  })
  .build();
