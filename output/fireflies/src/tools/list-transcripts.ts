import { SlateTool } from 'slates';
import { FirefliesClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let listTranscripts = SlateTool.create(
  spec,
  {
    name: 'List Transcripts',
    key: 'list_transcripts',
    description: `Search and list meeting transcripts with filtering options. Filter by keyword, date range, organizers, participants, channel, or show only your own meetings. Returns transcript metadata including title, date, duration, and URLs. Supports pagination with limit and skip parameters (max 50 per request).`,
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({
    keyword: z.string().optional().describe('Search for keywords in meeting title and/or spoken words (max 255 characters)'),
    scope: z.enum(['TITLE', 'SENTENCES', 'ALL']).optional().describe('Search scope for keyword filtering. Defaults to TITLE.'),
    fromDate: z.string().optional().describe('Start of date range filter (ISO 8601 format, e.g. 2024-01-01T00:00:00.000Z)'),
    toDate: z.string().optional().describe('End of date range filter (ISO 8601 format)'),
    limit: z.number().optional().describe('Maximum number of transcripts to return (max 50)'),
    skip: z.number().optional().describe('Number of transcripts to skip for pagination'),
    organizers: z.array(z.string()).optional().describe('Filter by organizer email addresses'),
    participants: z.array(z.string()).optional().describe('Filter by participant email addresses'),
    userId: z.string().optional().describe('Filter by user ID'),
    mine: z.boolean().optional().describe('If true, only return meetings owned by the API key owner'),
    channelId: z.string().optional().describe('Filter by channel ID'),
  }))
  .output(z.object({
    transcripts: z.array(z.object({
      transcriptId: z.string().describe('Unique transcript identifier'),
      title: z.string().nullable().describe('Meeting title'),
      date: z.string().nullable().describe('Meeting date'),
      duration: z.number().nullable().describe('Meeting duration in seconds'),
      organizerEmail: z.string().nullable().describe('Organizer email'),
      participants: z.array(z.string()).nullable().describe('List of participant emails'),
      privacy: z.string().nullable().describe('Privacy level of the transcript'),
      transcriptUrl: z.string().nullable().describe('URL to view the transcript'),
      audioUrl: z.string().nullable().describe('URL to the audio recording'),
      videoUrl: z.string().nullable().describe('URL to the video recording'),
      isLive: z.boolean().nullable().describe('Whether the meeting is currently live'),
    })).describe('List of matching transcripts'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new FirefliesClient({ token: ctx.auth.token });

    let transcripts = await client.getTranscripts({
      keyword: ctx.input.keyword,
      scope: ctx.input.scope,
      fromDate: ctx.input.fromDate,
      toDate: ctx.input.toDate,
      limit: ctx.input.limit,
      skip: ctx.input.skip,
      organizers: ctx.input.organizers,
      participants: ctx.input.participants,
      userId: ctx.input.userId,
      mine: ctx.input.mine,
      channelId: ctx.input.channelId,
    });

    let mapped = (transcripts || []).map((t: any) => ({
      transcriptId: t.id,
      title: t.title ?? null,
      date: t.date ? String(t.date) : null,
      duration: t.duration ?? null,
      organizerEmail: t.organizer_email ?? null,
      participants: t.participants ?? null,
      privacy: t.privacy ?? null,
      transcriptUrl: t.transcript_url ?? null,
      audioUrl: t.audio_url ?? null,
      videoUrl: t.video_url ?? null,
      isLive: t.is_live ?? null,
    }));

    return {
      output: { transcripts: mapped },
      message: `Found **${mapped.length}** transcript(s).${ctx.input.keyword ? ` Keyword: "${ctx.input.keyword}"` : ''}`,
    };
  })
  .build();
