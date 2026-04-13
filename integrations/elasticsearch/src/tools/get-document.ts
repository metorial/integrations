import { SlateTool } from 'slates';
import { ElasticsearchClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let getDocumentTool = SlateTool.create(spec, {
  name: 'Get Document',
  key: 'get_document',
  description: `Retrieve one or more documents by ID from an Elasticsearch index. Supports fetching a single document or multiple documents across indices using multi-get.`,
  tags: {
    destructive: false,
    readOnly: true
  }
})
  .input(
    z.object({
      indexName: z.string().describe('Name of the index to retrieve the document from'),
      documentId: z.string().optional().describe('ID of a single document to retrieve'),
      documentIds: z
        .array(z.string())
        .optional()
        .describe('Array of document IDs for multi-get')
    })
  )
  .output(
    z.object({
      found: z.boolean().describe('Whether the document was found'),
      documentId: z.string().optional().describe('The document ID'),
      indexName: z.string().optional().describe('The index name'),
      version: z.number().optional().describe('The document version'),
      source: z.record(z.string(), z.any()).optional().describe('The document source'),
      documents: z
        .array(
          z.object({
            documentId: z.string().describe('Document ID'),
            indexName: z.string().describe('Index name'),
            found: z.boolean().describe('Whether the document was found'),
            source: z.record(z.string(), z.any()).optional().describe('Document source')
          })
        )
        .optional()
        .describe('Array of documents for multi-get requests')
    })
  )
  .handleInvocation(async ctx => {
    let client = new ElasticsearchClient({
      baseUrl: ctx.auth.baseUrl,
      authHeader: ctx.auth.authHeader
    });

    if (ctx.input.documentIds && ctx.input.documentIds.length > 0) {
      let docs = ctx.input.documentIds.map(id => ({
        indexName: ctx.input.indexName,
        documentId: id
      }));
      let result = await client.multiGet(docs);
      let documents = (result.docs || []).map((doc: any) => ({
        documentId: doc._id,
        indexName: doc._index,
        found: doc.found,
        source: doc.found ? doc._source : undefined
      }));

      return {
        output: {
          found: documents.some((d: any) => d.found),
          documents
        },
        message: `Retrieved **${documents.filter((d: any) => d.found).length}** of **${documents.length}** documents from index **${ctx.input.indexName}**.`
      };
    }

    if (!ctx.input.documentId) {
      throw new Error('Either documentId or documentIds must be provided');
    }

    let result = await client.getDocument(ctx.input.indexName, ctx.input.documentId);

    return {
      output: {
        found: result.found,
        documentId: result._id,
        indexName: result._index,
        version: result._version,
        source: result._source
      },
      message: result.found
        ? `Document **${result._id}** found in index **${result._index}**.`
        : `Document **${ctx.input.documentId}** not found in index **${ctx.input.indexName}**.`
    };
  })
  .build();
