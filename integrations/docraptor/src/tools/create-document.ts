import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { baseDocumentInputSchema } from '../lib/schemas';
import { z } from 'zod';

export let createDocument = SlateTool.create(spec, {
  name: 'Create Document',
  key: 'create_document',
  description: `Synchronously converts HTML/CSS/JavaScript content into a PDF or Excel (XLS/XLSX) document. Returns the generated document as base64-encoded content. Content can be provided as inline HTML or by referencing a URL. For large or complex documents that may take longer than 60 seconds, use asynchronous document creation instead.`,
  instructions: [
    'Either documentContent or documentUrl must be provided, but not both.',
    'For Excel files (xls/xlsx), input must be valid XML rather than arbitrary HTML.',
    'By default, print CSS media rules are applied. Set princeOptions.media to "screen" if your styles target screen layout.'
  ],
  constraints: [
    'Synchronous requests have a 60-second timeout.',
    'The response is a base64-encoded binary document.'
  ],
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(baseDocumentInputSchema)
  .output(
    z.object({
      contentBase64: z.string().describe('The generated document encoded as a base64 string.'),
      contentLengthBytes: z.number().describe('Size of the generated document in bytes.')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let testMode = ctx.input.test ?? ctx.config.testMode ?? false;

    let result = await client.createDocument({
      ...ctx.input,
      test: testMode,
      princeOptions: ctx.input.princeOptions ?? undefined
    });

    return {
      output: {
        contentBase64: result.content,
        contentLengthBytes: result.contentLength
      },
      message: `Successfully created ${ctx.input.documentType.toUpperCase()} document${ctx.input.name ? ` "${ctx.input.name}"` : ''}${testMode ? ' (test mode)' : ''}. Size: ${result.contentLength} bytes.`
    };
  })
  .build();
