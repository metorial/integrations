import { SlateTool } from 'slates';
import { z } from 'zod';
import { FirefliesClient } from '../lib/client';
import { spec } from '../spec';
import { mapTranscriptDetail, transcriptDetailSchema } from './shared';

export let getTranscript = SlateTool.create(spec, {
  name: 'Get Transcript',
  key: 'get_transcript',
  description: `Retrieve the full details of a specific meeting transcript including sentences with timestamps and speaker labels, AI-generated summary, analytics, calendar metadata, channels, sharing metadata, attendee information, and meeting processing status.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      transcriptId: z.string().describe('The unique identifier of the transcript to retrieve')
    })
  )
  .output(transcriptDetailSchema)
  .handleInvocation(async ctx => {
    let client = new FirefliesClient({ token: ctx.auth.token });
    let transcript = await client.getTranscript(ctx.input.transcriptId);
    let output = mapTranscriptDetail(transcript);

    let sentenceCount = output.sentences?.length ?? 0;
    return {
      output,
      message: `Retrieved transcript **"${output.title}"** with ${sentenceCount} sentences and ${output.speakers?.length ?? 0} speakers.`
    };
  })
  .build();
