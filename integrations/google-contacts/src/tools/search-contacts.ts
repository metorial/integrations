import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { contactOutputSchema, formatContact } from '../lib/schemas';
import { z } from 'zod';

export let searchContacts = SlateTool.create(spec, {
  name: 'Search Contacts',
  key: 'search_contacts',
  description: `Searches the authenticated user's contacts by name, email address, phone number, or other fields. Returns matching contacts ranked by relevance.`,
  tags: {
    destructive: false,
    readOnly: true
  }
})
  .input(
    z.object({
      query: z
        .string()
        .describe(
          'Search query — matches against names, emails, phone numbers, and other contact fields'
        ),
      pageSize: z
        .number()
        .optional()
        .describe('Maximum number of results to return (default 30)')
    })
  )
  .output(
    z.object({
      contacts: z.array(contactOutputSchema).describe('Matching contacts')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });
    let result = await client.searchContacts(ctx.input.query, undefined, ctx.input.pageSize);

    let contacts = (result.results || []).map((r: any) => formatContact(r.person));

    return {
      output: { contacts },
      message: `Found **${contacts.length}** contacts matching "${ctx.input.query}".`
    };
  })
  .build();
