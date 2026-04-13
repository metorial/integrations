import { SlateTool } from 'slates';
import { FirefliesClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let uploadAudio = SlateTool.create(
  spec,
  {
    name: 'Upload Audio',
    key: 'upload_audio',
    description: `Upload an audio or video file for transcription by providing a publicly accessible URL. Supported formats: mp3, mp4, wav, m4a, ogg. Optionally specify attendees, language, and a webhook URL to receive a notification when transcription is complete.`,
    instructions: [
      'The URL must be publicly accessible via HTTPS.',
      'Provide attendee information to improve speaker identification and CRM integration.',
    ],
    constraints: [
      'Requires a paid plan (not available on free tier).',
      'Files must be at least 50KB unless bypass_size_check is set.',
    ],
  }
)
  .input(z.object({
    url: z.string().describe('Publicly accessible HTTPS URL of the audio/video file to transcribe'),
    title: z.string().optional().describe('Title to identify the transcribed file'),
    language: z.string().optional().describe('Language code for transcription (e.g. "es" for Spanish). Defaults to English.'),
    attendees: z.array(z.object({
      displayName: z.string().optional().describe('Attendee display name'),
      email: z.string().optional().describe('Attendee email address'),
      phoneNumber: z.string().optional().describe('Attendee phone number'),
    })).optional().describe('List of expected attendees for speaker identification'),
    webhookUrl: z.string().optional().describe('Webhook URL to be notified when transcription completes'),
    clientReferenceId: z.string().optional().describe('Custom identifier to track this upload (max 128 characters)'),
    bypassSizeCheck: z.boolean().optional().describe('Allow processing of audio files under 50KB'),
  }))
  .output(z.object({
    success: z.boolean().describe('Whether the upload was accepted'),
    title: z.string().nullable().describe('Title of the uploaded audio'),
    message: z.string().nullable().describe('Response message from Fireflies'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new FirefliesClient({ token: ctx.auth.token });

    let result = await client.uploadAudio({
      url: ctx.input.url,
      title: ctx.input.title,
      customLanguage: ctx.input.language,
      attendees: ctx.input.attendees,
      webhook: ctx.input.webhookUrl,
      clientReferenceId: ctx.input.clientReferenceId,
      bypassSizeCheck: ctx.input.bypassSizeCheck,
    });

    return {
      output: {
        success: result?.success ?? false,
        title: result?.title ?? null,
        message: result?.message ?? null,
      },
      message: result?.success
        ? `Audio upload accepted: **"${result?.title ?? ctx.input.title ?? 'Untitled'}"**. Transcription will begin shortly.`
        : `Audio upload failed: ${result?.message ?? 'Unknown error'}`,
    };
  })
  .build();
