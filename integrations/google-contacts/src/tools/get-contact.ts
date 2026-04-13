import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { googleContactsActionScopes } from '../scopes';
import { contactOutputSchema, formatContact } from '../lib/schemas';
import { z } from 'zod';

export let getContact = SlateTool.create(spec, {
  name: 'Get Contact',
  key: 'get_contact',
  description: `Retrieves detailed information about a specific contact by their resource name. Use \`people/me\` to get the authenticated user's profile. Returns all available contact fields.`,
  tags: {
    destructive: false,
    readOnly: true
  }
})
  .scopes(googleContactsActionScopes.getContact)
  .input(
    z.object({
      resourceName: z
        .string()
        .describe('Resource name of the contact (e.g., "people/c12345" or "people/me")')
    })
  )
  .output(contactOutputSchema)
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });
    let result = await client.getContact(ctx.input.resourceName);
    let contact = formatContact(result);

    let displayName =
      contact.names?.[0]?.displayName ||
      contact.emailAddresses?.[0]?.value ||
      ctx.input.resourceName;
    return {
      output: contact,
      message: `Retrieved contact **${displayName}**.`
    };
  })
  .build();
