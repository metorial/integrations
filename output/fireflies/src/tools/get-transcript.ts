import { SlateTool } from 'slates';
import { FirefliesClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let sentenceSchema = z.object({
  index: z.number().nullable().describe('Sentence index in the transcript'),
  text: z.string().nullable().describe('Processed sentence text'),
  rawText: z.string().nullable().describe('Raw unprocessed text'),
  startTime: z.number().nullable().describe('Start time in seconds'),
  endTime: z.number().nullable().describe('End time in seconds'),
  speakerId: z.number().nullable().describe('Speaker identifier'),
  speakerName: z.string().nullable().describe('Speaker name'),
});

let summarySchema = z.object({
  keywords: z.array(z.string()).nullable().describe('Key topics mentioned'),
  actionItems: z.array(z.string()).nullable().describe('Identified action items'),
  outline: z.array(z.string()).nullable().describe('Meeting outline'),
  shorthandBullet: z.array(z.string()).nullable().describe('Shorthand bullet points'),
  overview: z.string().nullable().describe('Meeting overview'),
  bulletGist: z.array(z.string()).nullable().describe('Bullet point gist'),
  gist: z.string().nullable().describe('Brief gist of the meeting'),
  shortSummary: z.string().nullable().describe('Short summary'),
});

export let getTranscript = SlateTool.create(
  spec,
  {
    name: 'Get Transcript',
    key: 'get_transcript',
    description: `Retrieve the full details of a specific meeting transcript including sentences with timestamps and speaker labels, AI-generated summary with action items and keywords, attendee information, and meeting analytics.`,
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({
    transcriptId: z.string().describe('The unique identifier of the transcript to retrieve'),
  }))
  .output(z.object({
    transcriptId: z.string().describe('Unique transcript identifier'),
    title: z.string().nullable().describe('Meeting title'),
    date: z.string().nullable().describe('Meeting date'),
    duration: z.number().nullable().describe('Meeting duration in seconds'),
    organizerEmail: z.string().nullable().describe('Organizer email'),
    participants: z.array(z.string()).nullable().describe('List of participant emails'),
    privacy: z.string().nullable().describe('Privacy level'),
    transcriptUrl: z.string().nullable().describe('URL to view the transcript'),
    audioUrl: z.string().nullable().describe('URL to the audio recording'),
    videoUrl: z.string().nullable().describe('URL to the video recording'),
    meetingLink: z.string().nullable().describe('Original meeting link'),
    isLive: z.boolean().nullable().describe('Whether the meeting is currently live'),
    speakers: z.array(z.object({
      speakerId: z.number().nullable().describe('Speaker identifier'),
      name: z.string().nullable().describe('Speaker name'),
    })).nullable().describe('Identified speakers in the meeting'),
    summary: summarySchema.nullable().describe('AI-generated meeting summary'),
    sentences: z.array(sentenceSchema).nullable().describe('Transcript sentences with timestamps and speaker attribution'),
    attendees: z.array(z.object({
      displayName: z.string().nullable().describe('Attendee display name'),
      email: z.string().nullable().describe('Attendee email'),
      phoneNumber: z.string().nullable().describe('Attendee phone number'),
    })).nullable().describe('Meeting attendees'),
    attendance: z.array(z.object({
      name: z.string().nullable().describe('Participant name'),
      joinTime: z.string().nullable().describe('When the participant joined'),
      leaveTime: z.string().nullable().describe('When the participant left'),
    })).nullable().describe('Meeting attendance with join/leave times'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new FirefliesClient({ token: ctx.auth.token });
    let t = await client.getTranscript(ctx.input.transcriptId);

    let output = {
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
      meetingLink: t.meeting_link ?? null,
      isLive: t.is_live ?? null,
      speakers: t.speakers?.map((s: any) => ({
        speakerId: s.id ?? null,
        name: s.name ?? null,
      })) ?? null,
      summary: t.summary ? {
        keywords: t.summary.keywords ?? null,
        actionItems: t.summary.action_items ?? null,
        outline: t.summary.outline ?? null,
        shorthandBullet: t.summary.shorthand_bullet ?? null,
        overview: t.summary.overview ?? null,
        bulletGist: t.summary.bullet_gist ?? null,
        gist: t.summary.gist ?? null,
        shortSummary: t.summary.short_summary ?? null,
      } : null,
      sentences: t.sentences?.map((s: any) => ({
        index: s.index ?? null,
        text: s.text ?? null,
        rawText: s.raw_text ?? null,
        startTime: s.start_time ?? null,
        endTime: s.end_time ?? null,
        speakerId: s.speaker_id ?? null,
        speakerName: s.speaker_name ?? null,
      })) ?? null,
      attendees: t.meeting_attendees?.map((a: any) => ({
        displayName: a.displayName ?? null,
        email: a.email ?? null,
        phoneNumber: a.phoneNumber ?? null,
      })) ?? null,
      attendance: t.meeting_attendance?.map((a: any) => ({
        name: a.name ?? null,
        joinTime: a.join_time ?? null,
        leaveTime: a.leave_time ?? null,
      })) ?? null,
    };

    let sentenceCount = output.sentences?.length ?? 0;
    return {
      output,
      message: `Retrieved transcript **"${output.title}"** with ${sentenceCount} sentences and ${output.speakers?.length ?? 0} speakers.`,
    };
  })
  .build();
