import { SlateTool } from 'slates';
import { SnapchatClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let segmentSchema = z.object({
  segmentId: z.string().describe('Unique ID of the audience segment'),
  name: z.string().optional().describe('Segment name'),
  description: z.string().optional().describe('Segment description'),
  status: z.string().optional().describe('Segment status'),
  sourceType: z.string().optional().describe('Source type'),
  retentionInDays: z.number().optional().describe('Retention period in days'),
  approximateNumberUsers: z.number().optional().describe('Approximate number of matched users'),
  createdAt: z.string().optional().describe('Creation timestamp'),
  updatedAt: z.string().optional().describe('Last update timestamp')
});

export let listAudienceSegments = SlateTool.create(
  spec,
  {
    name: 'List Audience Segments',
    key: 'list_audience_segments',
    description: `List all custom audience segments under a Snapchat ad account. Returns segment IDs, names, source types, user counts, and statuses.`,
    tags: {
      readOnly: true
    }
  }
)
  .input(z.object({
    adAccountId: z.string().describe('Ad account ID to list segments for')
  }))
  .output(z.object({
    segments: z.array(segmentSchema).describe('List of audience segments')
  }))
  .handleInvocation(async (ctx) => {
    let client = new SnapchatClient(ctx.auth.token);
    let results = await client.listSegments(ctx.input.adAccountId);

    let segments = results.map((s: any) => ({
      segmentId: s.id,
      name: s.name,
      description: s.description,
      status: s.status,
      sourceType: s.source_type,
      retentionInDays: s.retention_in_days,
      approximateNumberUsers: s.approximate_number_users,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }));

    return {
      output: { segments },
      message: `Found **${segments.length}** audience segment(s).`
    };
  })
  .build();
