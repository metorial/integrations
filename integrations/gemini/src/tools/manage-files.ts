import { SlateTool } from 'slates';
import { createClient } from '../lib/helpers';
import { spec } from '../spec';
import { z } from 'zod';

let fileSchema = z.object({
  fileName: z.string().describe('Resource name of the file (e.g. "files/abc123")'),
  displayName: z.string().optional().describe('Display name of the file'),
  mimeType: z.string().optional().describe('MIME type of the file'),
  sizeBytes: z.string().optional().describe('File size in bytes'),
  createTime: z.string().optional().describe('File creation timestamp'),
  updateTime: z.string().optional().describe('File last update timestamp'),
  expirationTime: z
    .string()
    .optional()
    .describe('When the file will be automatically deleted (48 hours after upload)'),
  sha256Hash: z.string().optional().describe('SHA-256 hash of the file content'),
  uri: z.string().optional().describe('URI to reference this file in generation requests'),
  state: z
    .string()
    .optional()
    .describe('Processing state of the file (PROCESSING, ACTIVE, FAILED)')
});

export let listFiles = SlateTool.create(spec, {
  name: 'List Files',
  key: 'list_files',
  description: `List files previously uploaded to the Gemini File API. Files are stored for 48 hours and can be referenced in generation requests by their URI.`,
  tags: {
    readOnly: true,
    destructive: false
  }
})
  .input(
    z.object({
      pageSize: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe('Maximum number of files to return'),
      pageToken: z.string().optional().describe('Token for fetching the next page')
    })
  )
  .output(
    z.object({
      files: z.array(fileSchema).describe('Uploaded files'),
      nextPageToken: z.string().optional().describe('Token for the next page')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx);

    let result = await client.listFiles({
      pageSize: ctx.input.pageSize,
      pageToken: ctx.input.pageToken
    });

    let files = (result.files ?? []).map((f: any) => ({
      fileName: f.name,
      displayName: f.displayName,
      mimeType: f.mimeType,
      sizeBytes: f.sizeBytes,
      createTime: f.createTime,
      updateTime: f.updateTime,
      expirationTime: f.expirationTime,
      sha256Hash: f.sha256Hash,
      uri: f.uri,
      state: f.state
    }));

    return {
      output: {
        files,
        nextPageToken: result.nextPageToken
      },
      message: `Found **${files.length}** uploaded file(s).`
    };
  })
  .build();

export let getFile = SlateTool.create(spec, {
  name: 'Get File',
  key: 'get_file',
  description: `Get metadata for a file previously uploaded to the Gemini File API. Returns file details including processing state, size, MIME type, and expiration time.`,
  tags: {
    readOnly: true,
    destructive: false
  }
})
  .input(
    z.object({
      fileName: z
        .string()
        .describe('Resource name or ID of the file (e.g. "files/abc123" or "abc123")')
    })
  )
  .output(fileSchema)
  .handleInvocation(async ctx => {
    let client = createClient(ctx);

    let f = await client.getFile(ctx.input.fileName);

    return {
      output: {
        fileName: f.name,
        displayName: f.displayName,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
        createTime: f.createTime,
        updateTime: f.updateTime,
        expirationTime: f.expirationTime,
        sha256Hash: f.sha256Hash,
        uri: f.uri,
        state: f.state
      },
      message: `Retrieved file **${f.displayName ?? f.name}** (${f.mimeType ?? 'unknown type'}, state: ${f.state ?? 'unknown'}).`
    };
  })
  .build();

export let deleteFile = SlateTool.create(spec, {
  name: 'Delete File',
  key: 'delete_file',
  description: `Delete a file previously uploaded to the Gemini File API. The file will no longer be available for use in generation requests.`,
  tags: {
    readOnly: false,
    destructive: true
  }
})
  .input(
    z.object({
      fileName: z
        .string()
        .describe(
          'Resource name or ID of the file to delete (e.g. "files/abc123" or "abc123")'
        )
    })
  )
  .output(
    z.object({
      deleted: z.boolean().describe('Whether the file was successfully deleted')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx);

    await client.deleteFile(ctx.input.fileName);

    return {
      output: { deleted: true },
      message: `Deleted file **${ctx.input.fileName}**.`
    };
  })
  .build();
