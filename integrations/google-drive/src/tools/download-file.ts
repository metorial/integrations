import { SlateTool } from 'slates';
import { GoogleDriveClient, MAX_DRIVE_DOWNLOAD_BYTES } from '../lib/client';
import { googleDriveActionScopes } from '../scopes';
import { spec } from '../spec';
import { z } from 'zod';

export let downloadFileTool = SlateTool.create(spec, {
  name: 'Download File',
  key: 'download_file',
  description: `Download a **non–Google Workspace** file from Drive as bytes (see output for encoding). For Docs, Sheets, or Slides, use **Export File** instead.`,
  instructions: [
    'Decode `contentBase64` to bytes after the call. For UTF-8 text files, decode base64 then interpret as UTF-8 string.',
    'Google sets `mimeType` from the download response when present (may include a charset suffix).'
  ],
  constraints: [
    'Google Docs/Sheets/Slides (and other `application/vnd.google-apps.*` files) cannot use this tool — the API blocks `alt=media` for them. Use **Export File** (e.g. `text/plain` or `application/pdf`) even for tiny documents.',
    `Binary downloads are capped at ${MAX_DRIVE_DOWNLOAD_BYTES} bytes in one response so MCP JSON payloads stay within limits.`
  ],
  tags: {
    readOnly: true
  }
})
  .scopes(googleDriveActionScopes.downloadFile)
  .input(
    z.object({
      fileId: z.string().describe('ID of the file to download')
    })
  )
  .output(
    z.object({
      fileId: z.string().describe('ID of the downloaded file'),
      contentBase64: z
        .string()
        .describe('Raw file bytes, standard base64 (not a data URL prefix)'),
      byteLength: z.number().describe('Byte length of the decoded file'),
      mimeType: z
        .string()
        .optional()
        .describe('Content-Type from Google’s download response when present')
    })
  )
  .handleInvocation(async ctx => {
    let client = new GoogleDriveClient(ctx.auth.token);
    let { contentBase64, byteLength, mimeType } = await client.downloadFile(ctx.input.fileId);

    return {
      output: {
        fileId: ctx.input.fileId,
        contentBase64,
        byteLength,
        mimeType
      },
      message: `Downloaded file \`${ctx.input.fileId}\` (${byteLength} bytes as base64).${mimeType ? ` MIME: \`${mimeType}\`.` : ''}`
    };
  })
  .build();
