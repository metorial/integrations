import { SlateTool } from 'slates';
import { createClient } from '../lib/helpers';
import { spec } from '../spec';
import { z } from 'zod';

export let listFiles = SlateTool.create(spec, {
  name: 'List Files',
  key: 'list_files',
  description: `List files uploaded to OpenAI, optionally filtered by purpose (e.g. "fine-tune", "assistants"). Returns file metadata including ID, name, size, and purpose.`,
  tags: {
    readOnly: true,
    destructive: false
  }
})
  .input(
    z.object({
      purpose: z
        .string()
        .optional()
        .describe('Filter files by purpose (e.g. "fine-tune", "assistants", "batch")')
    })
  )
  .output(
    z.object({
      files: z
        .array(
          z.object({
            fileId: z.string().describe('File identifier'),
            filename: z.string().describe('Name of the file'),
            bytes: z.number().describe('File size in bytes'),
            purpose: z.string().describe('Purpose of the file'),
            createdAt: z.number().describe('Unix timestamp when the file was uploaded'),
            status: z.string().optional().describe('Processing status of the file')
          })
        )
        .describe('List of files')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx);
    let result = await client.listFiles({ purpose: ctx.input.purpose });

    let files = (result.data ?? []).map((f: any) => ({
      fileId: f.id,
      filename: f.filename,
      bytes: f.bytes,
      purpose: f.purpose,
      createdAt: f.created_at,
      status: f.status
    }));

    return {
      output: { files },
      message: `Found **${files.length}** file(s)${ctx.input.purpose ? ` with purpose "${ctx.input.purpose}"` : ''}.`
    };
  })
  .build();

export let getFile = SlateTool.create(spec, {
  name: 'Get File',
  key: 'get_file',
  description: `Retrieve metadata for a specific file by its ID. Returns file details including name, size, purpose, and status.`,
  tags: {
    readOnly: true,
    destructive: false
  }
})
  .input(
    z.object({
      fileId: z.string().describe('File ID to retrieve')
    })
  )
  .output(
    z.object({
      fileId: z.string().describe('File identifier'),
      filename: z.string().describe('Name of the file'),
      bytes: z.number().describe('File size in bytes'),
      purpose: z.string().describe('Purpose of the file'),
      createdAt: z.number().describe('Unix timestamp when the file was uploaded'),
      status: z.string().optional().describe('Processing status')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx);
    let f = await client.getFile(ctx.input.fileId);

    return {
      output: {
        fileId: f.id,
        filename: f.filename,
        bytes: f.bytes,
        purpose: f.purpose,
        createdAt: f.created_at,
        status: f.status
      },
      message: `File **${f.filename}** (${f.id}), ${f.bytes} bytes, purpose: ${f.purpose}.`
    };
  })
  .build();

export let deleteFile = SlateTool.create(spec, {
  name: 'Delete File',
  key: 'delete_file',
  description: `Delete a file from your OpenAI account by its ID. The file will no longer be available for use with fine-tuning, vector stores, or other features.`,
  tags: {
    readOnly: false,
    destructive: true
  }
})
  .input(
    z.object({
      fileId: z.string().describe('File ID to delete')
    })
  )
  .output(
    z.object({
      fileId: z.string().describe('ID of the deleted file'),
      deleted: z.boolean().describe('Whether the file was successfully deleted')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx);
    let result = await client.deleteFile(ctx.input.fileId);

    return {
      output: {
        fileId: result.id,
        deleted: result.deleted
      },
      message: `Deleted file **${result.id}**.`
    };
  })
  .build();
