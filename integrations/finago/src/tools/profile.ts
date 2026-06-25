import { SlateTool } from 'slates';
import { z } from 'zod';
import { extractRecords } from '../lib/client';
import { createClientFromContext } from '../lib/helpers';
import { spec } from '../spec';

export let finagoGetProfile = SlateTool.create(spec, {
  name: 'Get Profile',
  key: 'finago_get_profile',
  description:
    'Read the connected Finago profile and organization context, with optional identifiers, licenses, license organization, and organization people.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      includeIdentifiers: z
        .boolean()
        .optional()
        .describe('Also read /me/identifiers for the connected profile.'),
      includeLicenses: z.boolean().optional().describe('Also read /me/licenses.'),
      includePeople: z.boolean().optional().describe('Also read /organization/people.'),
      licenseId: z
        .string()
        .optional()
        .describe('Optional license ID used to read /me/licenses/{licenseId}/organization.')
    })
  )
  .output(
    z.object({
      profile: z.unknown().optional().describe('Profile returned by /me.'),
      organization: z.unknown().optional().describe('Organization returned by Finago.'),
      identifiers: z.array(z.unknown()).optional().describe('Profile identifiers.'),
      licenses: z.array(z.unknown()).optional().describe('Profile licenses.'),
      people: z.array(z.unknown()).optional().describe('Organization people.'),
      peopleCount: z.number().optional().describe('Number of people returned.')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);
    let [profile, organization] = await Promise.all([
      client.get('/me', undefined, 'read profile'),
      ctx.input.licenseId
        ? client.get(
            `/me/licenses/${encodeURIComponent(ctx.input.licenseId)}/organization`,
            undefined,
            'read license organization'
          )
        : client.get('/organization', undefined, 'read organization')
    ]);

    let identifiers = ctx.input.includeIdentifiers
      ? extractRecords(await client.get('/me/identifiers', undefined, 'read identifiers'))
      : undefined;
    let licenses = ctx.input.includeLicenses
      ? extractRecords(await client.get('/me/licenses', undefined, 'read licenses'))
      : undefined;
    let people = ctx.input.includePeople
      ? extractRecords(await client.get('/organization/people', undefined, 'read people'))
      : undefined;

    return {
      output: {
        profile,
        organization,
        identifiers,
        licenses,
        people,
        peopleCount: people?.length
      },
      message: `Retrieved Finago profile and organization${people ? ` with ${people.length} people` : ''}.`
    };
  })
  .build();
