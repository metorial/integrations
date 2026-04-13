import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let downloadDocument = SlateTool.create(spec, {
  name: 'Download Document',
  key: 'download_document',
  description: `Download a signed document PDF or its audit trail. Returns the file as a base64-encoded data URI. Use "document" to download the signed PDF or "auditLog" to download the tamper-proof audit trail.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      documentId: z.string().describe('The ID of the document to download'),
      downloadType: z
        .enum(['document', 'auditLog'])
        .default('document')
        .describe('What to download: the signed document PDF or the audit trail'),
      onBehalfOf: z.string().optional().describe('Download on behalf of this email address')
    })
  )
  .output(
    z.object({
      downloadUrl: z.string().describe('Base64-encoded data URI of the downloaded file')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({
      token: ctx.auth.token,
      region: ctx.config.region
    });

    let result =
      ctx.input.downloadType === 'auditLog'
        ? await client.downloadAuditLog(ctx.input.documentId, ctx.input.onBehalfOf)
        : await client.downloadDocument(ctx.input.documentId, ctx.input.onBehalfOf);

    return {
      output: result,
      message: `Downloaded ${ctx.input.downloadType === 'auditLog' ? 'audit trail' : 'document'} for **${ctx.input.documentId}**.`
    };
  })
  .build();
