import { createBase64Attachment, SlateTool } from 'slates';
import { z } from 'zod';
import { finagoServiceError } from '../lib/errors';
import { createClientFromContext } from '../lib/helpers';
import { getNumber, getString } from '../lib/records';
import { spec } from '../spec';

export let finagoUploadTransactionFile = SlateTool.create(spec, {
  name: 'Upload Transaction File',
  key: 'finago_upload_transaction_file',
  description:
    'Upload a file for later attachment to a Finago transaction. The tool initiates the upload, uploads the provided base64 bytes to Finago’s presigned URL, and returns file metadata only.',
  tags: { readOnly: false, destructive: false }
})
  .input(
    z.object({
      contentType: z.string().describe('MIME type, such as application/pdf.'),
      contentBase64: z.string().describe('Base64-encoded file bytes to upload.'),
      fileName: z
        .string()
        .optional()
        .describe(
          'Local filename for user context. Finago fileUpload only requires contentType.'
        )
    })
  )
  .output(
    z.object({
      fileId: z.string().optional().describe('Finago file upload ID.'),
      uploadMethod: z.string().optional().describe('HTTP method used for presigned upload.'),
      byteLength: z.number().describe('Uploaded byte length.'),
      fileName: z.string().optional().describe('Input filename.'),
      contentType: z.string().describe('Uploaded MIME type.'),
      record: z.unknown().describe('Raw Finago file upload initiation response.')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);
    let upload = await client.post(
      '/fileUpload',
      { contentType: ctx.input.contentType },
      undefined,
      'initiate file upload'
    );

    let uploadUrl = getString(upload, 'uploadUrl');
    let uploadMethod = getString(upload, 'uploadMethod') ?? 'PUT';
    if (!uploadUrl) {
      throw finagoServiceError('Finago did not return an uploadUrl.');
    }

    let uploaded = await client.putBinaryUrl({
      url: uploadUrl,
      method: uploadMethod,
      contentType: ctx.input.contentType,
      contentBase64: ctx.input.contentBase64
    });

    let rawFileId = getString(upload, 'fileId') ?? getNumber(upload, 'fileId')?.toString();

    return {
      output: {
        fileId: rawFileId,
        uploadMethod,
        byteLength: uploaded.byteLength,
        fileName: ctx.input.fileName,
        contentType: ctx.input.contentType,
        record: upload
      },
      message: `Uploaded **${ctx.input.fileName ?? rawFileId ?? 'Finago file'}** (${uploaded.byteLength} bytes).`
    };
  })
  .build();

export let finagoGetFileUploadStatus = SlateTool.create(spec, {
  name: 'Get File Upload Status',
  key: 'finago_get_file_upload_status',
  description:
    'Check the status of a Finago file upload and retrieve the documentId once Finago finishes processing it.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      fileId: z.string().describe('Finago file upload ID.')
    })
  )
  .output(
    z.object({
      fileId: z.string().optional(),
      status: z.string().optional(),
      documentId: z.number().optional(),
      record: z.unknown().describe('Raw Finago file upload status response.')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);
    let record = await client.get(
      `/fileUpload/${encodeURIComponent(ctx.input.fileId)}`,
      undefined,
      'get file upload status'
    );

    return {
      output: {
        fileId: getString(record, 'fileId') ?? ctx.input.fileId,
        status: getString(record, 'status'),
        documentId: getNumber(record, 'documentId'),
        record
      },
      message: `Finago file upload **${ctx.input.fileId}** status: **${getString(record, 'status') ?? 'unknown'}**.`
    };
  })
  .build();

export let finagoGetDocument = SlateTool.create(spec, {
  name: 'Get Document',
  key: 'finago_get_document',
  description:
    'Read Finago document metadata and optionally download the document through Slate attachments. Downloaded content is never returned inline.',
  tags: { readOnly: true, destructive: false }
})
  .input(
    z.object({
      documentId: z.number().int().positive().describe('Finago document ID.'),
      download: z
        .boolean()
        .optional()
        .describe('Download the document and return it as a Slate attachment.')
    })
  )
  .output(
    z.object({
      documentId: z.number().optional(),
      contentType: z.string().optional(),
      pages: z.array(z.unknown()).optional(),
      byteLength: z.number().optional(),
      attachmentCount: z.number().describe('Number of Slate attachments returned.'),
      record: z.unknown().describe('Raw Finago document metadata response.')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClientFromContext(ctx);
    let record = await client.get(
      `/documents/${ctx.input.documentId}`,
      undefined,
      'get document'
    );
    let downloadUrl = getString(record, 'downloadUrl');
    let contentType = getString(record, 'contentType');
    let attachments: ReturnType<typeof createBase64Attachment>[] = [];
    let byteLength: number | undefined;

    if (ctx.input.download) {
      if (!downloadUrl) {
        throw finagoServiceError('Finago did not return a document downloadUrl.');
      }
      let downloaded = await client.downloadUrl(downloadUrl, contentType);
      byteLength = downloaded.byteLength;
      attachments.push(
        createBase64Attachment(
          downloaded.contentBase64,
          downloaded.contentType ?? contentType ?? 'application/octet-stream'
        )
      );
    }

    return {
      output: {
        documentId: getNumber(record, 'documentId') ?? ctx.input.documentId,
        contentType,
        pages:
          typeof record === 'object' &&
          record !== null &&
          'pages' in record &&
          Array.isArray(record.pages)
            ? record.pages
            : undefined,
        byteLength,
        attachmentCount: attachments.length,
        record
      },
      attachments,
      message: `Retrieved Finago document **${ctx.input.documentId}**${attachments.length ? ' with an attachment' : ''}.`
    };
  })
  .build();
