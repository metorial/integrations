import { SlateTool } from 'slates';
import { SnapchatClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let addUsersToSegment = SlateTool.create(
  spec,
  {
    name: 'Add Users to Segment',
    key: 'add_users_to_segment',
    description: `Add users to a Snapchat custom audience segment using hashed identifiers. Supports SHA-256 hashed email addresses, phone numbers, and mobile advertiser IDs. Identifiers must be pre-hashed before submission.`,
    instructions: [
      'All identifiers must be SHA-256 hashed before sending.',
      'Emails should be lowercased and trimmed before hashing.',
      'Phone numbers should include country code without spaces or special characters before hashing.',
      'Maximum 100,000 identifiers per request.'
    ],
    constraints: [
      'Maximum 100,000 identifiers per API call.',
      'A segment requires at least 1,000 matched users to be usable for ad targeting.'
    ]
  }
)
  .input(z.object({
    segmentId: z.string().describe('Audience segment ID to add users to'),
    schema: z.array(z.enum(['EMAIL_SHA256', 'PHONE_SHA256', 'MOBILE_AD_ID_SHA256']))
      .describe('Schema describing the identifier types in the data, in order'),
    users: z.array(z.array(z.string()))
      .describe('Array of user records, each record is an array of hashed identifiers matching the schema order')
  }))
  .output(z.object({
    numberUploadedUsers: z.number().describe('Number of users uploaded in this request')
  }))
  .handleInvocation(async (ctx) => {
    let client = new SnapchatClient(ctx.auth.token);

    let result = await client.addUsersToSegment(ctx.input.segmentId, {
      users: ctx.input.users.map((record) => ({
        schema: ctx.input.schema,
        data: record
      }))
    });

    return {
      output: {
        numberUploadedUsers: ctx.input.users.length
      },
      message: `Uploaded **${ctx.input.users.length}** user record(s) to segment **${ctx.input.segmentId}**.`
    };
  })
  .build();
