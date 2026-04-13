import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { contactOutputSchema, formatContact } from '../lib/schemas';
import { z } from 'zod';

export let listContacts = SlateTool.create(spec, {
  name: 'List Contacts',
  key: 'list_contacts',
  description: `Lists the authenticated user's contacts with pagination support. Returns contacts sorted by the specified order. Use the \`pageToken\` from a previous response to fetch the next page.`,
  tags: {
    destructive: false,
    readOnly: true
  }
})
  .input(
    z.object({
      pageSize: z
        .number()
        .optional()
        .describe('Number of contacts to return per page (max 1000, default 100)'),
      pageToken: z.string().optional().describe('Token for fetching the next page of results'),
      sortOrder: z
        .enum([
          'LAST_MODIFIED_ASCENDING',
          'LAST_MODIFIED_DESCENDING',
          'FIRST_NAME_ASCENDING',
          'LAST_NAME_ASCENDING'
        ])
        .optional()
        .describe('Sort order for the results')
    })
  )
  .output(
    z.object({
      contacts: z.array(contactOutputSchema).describe('List of contacts'),
      nextPageToken: z.string().optional().describe('Token for fetching the next page'),
      totalPeople: z.number().optional().describe('Total number of contacts'),
      totalItems: z.number().optional().describe('Total number of items in response')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });
    let result = await client.listContacts({
      pageSize: ctx.input.pageSize,
      pageToken: ctx.input.pageToken,
      sortOrder: ctx.input.sortOrder
    });

    let contacts = (result.connections || []).map(formatContact);

    return {
      output: {
        contacts,
        nextPageToken: result.nextPageToken,
        totalPeople: result.totalPeople,
        totalItems: result.totalItems
      },
      message: `Listed **${contacts.length}** contacts${result.totalPeople ? ` out of ${result.totalPeople} total` : ''}.${result.nextPageToken ? ' More pages available.' : ''}`
    };
  })
  .build();
