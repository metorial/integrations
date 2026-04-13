import { SlateTool } from 'slates';
import { GongClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let createMeeting = SlateTool.create(spec, {
  name: 'Create Meeting',
  key: 'create_meeting',
  description: `Create a new meeting in Gong. Define the meeting title, schedule, organizer, and attendees. The meeting will appear in Gong's meeting tracking.`,
  tags: {
    destructive: false
  }
})
  .input(
    z.object({
      title: z.string().optional().describe('Meeting title'),
      scheduledStartTime: z.string().optional().describe('Scheduled start in ISO 8601 format'),
      scheduledEndTime: z.string().optional().describe('Scheduled end in ISO 8601 format'),
      organizerEmail: z.string().optional().describe('Email of the meeting organizer'),
      attendees: z
        .array(
          z.object({
            email: z.string().describe('Attendee email'),
            name: z.string().optional().describe('Attendee name')
          })
        )
        .optional()
        .describe('List of meeting attendees'),
      meetingUrl: z.string().optional().describe('URL for the meeting (e.g., Zoom link)'),
      workspaceId: z.string().optional().describe('Workspace ID')
    })
  )
  .output(
    z.object({
      meetingId: z.string().optional().describe('ID of the created meeting')
    })
  )
  .handleInvocation(async ctx => {
    let client = new GongClient({
      token: ctx.auth.token,
      baseUrl: ctx.auth.baseUrl
    });

    let result = await client.createMeeting({
      title: ctx.input.title,
      scheduledStartTime: ctx.input.scheduledStartTime,
      scheduledEndTime: ctx.input.scheduledEndTime,
      organizerEmail: ctx.input.organizerEmail,
      attendees: ctx.input.attendees,
      meetingUrl: ctx.input.meetingUrl,
      workspaceId: ctx.input.workspaceId
    });

    return {
      output: {
        meetingId: result.meetingId || result.id
      },
      message: `Created meeting${ctx.input.title ? ` **${ctx.input.title}**` : ''}.`
    };
  })
  .build();

export let deleteMeeting = SlateTool.create(spec, {
  name: 'Delete Meeting',
  key: 'delete_meeting',
  description: `Delete a meeting from Gong by its ID. This permanently removes the meeting record.`,
  tags: {
    destructive: true
  }
})
  .input(
    z.object({
      meetingId: z.string().describe('ID of the meeting to delete')
    })
  )
  .output(
    z.object({
      success: z.boolean().describe('Whether the deletion was successful')
    })
  )
  .handleInvocation(async ctx => {
    let client = new GongClient({
      token: ctx.auth.token,
      baseUrl: ctx.auth.baseUrl
    });

    await client.deleteMeeting(ctx.input.meetingId);

    return {
      output: {
        success: true
      },
      message: `Deleted meeting **${ctx.input.meetingId}**.`
    };
  })
  .build();
