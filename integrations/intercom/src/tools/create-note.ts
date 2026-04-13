import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let createNote = SlateTool.create(spec, {
  name: 'Create Note',
  key: 'create_note',
  description: `Add an internal note to a contact's profile. Notes are visible only to teammates, not to the contact. Useful for recording internal context about a customer.`,
  tags: {
    readOnly: false
  }
})
  .input(
    z.object({
      contactId: z.string().describe('Contact ID to add the note to'),
      body: z.string().describe('Note body (HTML supported)'),
      adminId: z.string().optional().describe('Admin ID creating the note')
    })
  )
  .output(
    z.object({
      noteId: z.string().describe('Created note ID'),
      body: z.string().optional().describe('Note body'),
      authorId: z.string().optional().describe('Author admin ID'),
      authorName: z.string().optional().describe('Author name'),
      createdAt: z.string().optional().describe('Creation timestamp')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token, region: ctx.config.region });

    let result = await client.createNote(
      ctx.input.contactId,
      ctx.input.body,
      ctx.input.adminId
    );

    return {
      output: {
        noteId: result.id,
        body: result.body,
        authorId: result.author?.id ? String(result.author.id) : undefined,
        authorName: result.author?.name,
        createdAt: result.created_at ? String(result.created_at) : undefined
      },
      message: `Added note to contact **${ctx.input.contactId}**`
    };
  })
  .build();
