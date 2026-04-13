import { SlateTool } from 'slates';
import { GoogleDriveClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let exportFileTool = SlateTool.create(spec, {
  name: 'Export File',
  key: 'export_file',
  description: `Export a Google Workspace file (Docs, Sheets, Slides, Drawings) to a standard format such as PDF, DOCX, XLSX, CSV, or plain text. Only works with Google Workspace native formats — for regular files use the **Download File** tool.`,
  instructions: [
    'Common export formats: application/pdf, text/plain, text/csv, text/html, application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX), application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (XLSX), application/vnd.openxmlformats-officedocument.presentationml.presentation (PPTX).',
    'Google Docs support: PDF, DOCX, TXT, HTML, RTF, ODT, EPUB.',
    'Google Sheets support: PDF, XLSX, CSV, TSV, ODS.',
    'Google Slides support: PDF, PPTX, ODP, TXT.',
    'Output is **base64** (`contentBase64`) so binary exports (PDF, XLSX, …) and Google’s varying `Content-Type` headers work reliably through JSON-only transports.'
  ],
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      fileId: z.string().describe('ID of the Google Workspace file to export'),
      exportMimeType: z
        .string()
        .describe('Target MIME type to export to (e.g. "application/pdf", "text/csv")')
    })
  )
  .output(
    z.object({
      fileId: z.string(),
      exportMimeType: z.string(),
      contentBase64: z.string().describe('Exported file bytes as standard base64'),
      byteLength: z.number().describe('Byte length of the decoded export'),
      mimeType: z
        .string()
        .optional()
        .describe('Content-Type from Google’s export response when present')
    })
  )
  .handleInvocation(async ctx => {
    let client = new GoogleDriveClient(ctx.auth.token);
    let { contentBase64, byteLength, mimeType } = await client.exportFile(
      ctx.input.fileId,
      ctx.input.exportMimeType
    );

    return {
      output: {
        fileId: ctx.input.fileId,
        exportMimeType: ctx.input.exportMimeType,
        contentBase64,
        byteLength,
        mimeType
      },
      message: `Exported file \`${ctx.input.fileId}\` as \`${ctx.input.exportMimeType}\` (${byteLength} bytes as base64).${mimeType ? ` MIME: \`${mimeType}\`.` : ''}`
    };
  })
  .build();
