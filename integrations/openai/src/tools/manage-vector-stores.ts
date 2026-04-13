import { SlateTool } from 'slates';
import { createClient } from '../lib/helpers';
import { spec } from '../spec';
import { z } from 'zod';

export let createVectorStore = SlateTool.create(spec, {
  name: 'Create Vector Store',
  key: 'create_vector_store',
  description: `Create a managed vector store for uploading, chunking, and searching files. Vector stores power file search in the Responses API and support hybrid search (semantic + keyword).`,
  tags: {
    readOnly: false,
    destructive: false
  }
})
  .input(
    z.object({
      name: z.string().optional().describe('Name for the vector store'),
      fileIds: z
        .array(z.string())
        .optional()
        .describe('File IDs to add to the store on creation'),
      expiresAfterDays: z
        .number()
        .optional()
        .describe('Number of days after last activity before the store expires'),
      metadata: z
        .record(z.string(), z.string())
        .optional()
        .describe('Key-value metadata to attach to the vector store')
    })
  )
  .output(
    z.object({
      vectorStoreId: z.string().describe('Vector store identifier'),
      name: z.string().nullable().describe('Name of the vector store'),
      status: z.string().describe('Current status of the vector store'),
      fileCounts: z
        .object({
          inProgress: z.number(),
          completed: z.number(),
          failed: z.number(),
          cancelled: z.number(),
          total: z.number()
        })
        .describe('File processing counts'),
      createdAt: z.number().describe('Unix timestamp when created')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx);

    let result = await client.createVectorStore({
      name: ctx.input.name,
      fileIds: ctx.input.fileIds,
      expiresAfter: ctx.input.expiresAfterDays
        ? { anchor: 'last_active_at', days: ctx.input.expiresAfterDays }
        : undefined,
      metadata: ctx.input.metadata
    });

    return {
      output: {
        vectorStoreId: result.id,
        name: result.name ?? null,
        status: result.status,
        fileCounts: {
          inProgress: result.file_counts?.in_progress ?? 0,
          completed: result.file_counts?.completed ?? 0,
          failed: result.file_counts?.failed ?? 0,
          cancelled: result.file_counts?.cancelled ?? 0,
          total: result.file_counts?.total ?? 0
        },
        createdAt: result.created_at
      },
      message: `Created vector store **${result.id}**${result.name ? ` ("${result.name}")` : ''}.`
    };
  })
  .build();

export let listVectorStores = SlateTool.create(spec, {
  name: 'List Vector Stores',
  key: 'list_vector_stores',
  description: `List all vector stores in your OpenAI project. Returns store metadata, file counts, and status information.`,
  tags: {
    readOnly: true,
    destructive: false
  }
})
  .input(
    z.object({
      limit: z.number().optional().describe('Maximum number of stores to return (default 20)'),
      order: z.enum(['asc', 'desc']).optional().describe('Sort order by creation time'),
      after: z.string().optional().describe('Cursor for pagination'),
      before: z.string().optional().describe('Cursor for pagination')
    })
  )
  .output(
    z.object({
      vectorStores: z
        .array(
          z.object({
            vectorStoreId: z.string().describe('Vector store identifier'),
            name: z.string().nullable().describe('Name of the vector store'),
            status: z.string().describe('Current status'),
            fileCounts: z
              .object({
                total: z.number(),
                completed: z.number(),
                inProgress: z.number(),
                failed: z.number()
              })
              .describe('File processing counts'),
            createdAt: z.number().describe('Unix timestamp when created')
          })
        )
        .describe('List of vector stores')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx);
    let result = await client.listVectorStores({
      limit: ctx.input.limit,
      order: ctx.input.order,
      after: ctx.input.after,
      before: ctx.input.before
    });

    let vectorStores = (result.data ?? []).map((vs: any) => ({
      vectorStoreId: vs.id,
      name: vs.name ?? null,
      status: vs.status,
      fileCounts: {
        total: vs.file_counts?.total ?? 0,
        completed: vs.file_counts?.completed ?? 0,
        inProgress: vs.file_counts?.in_progress ?? 0,
        failed: vs.file_counts?.failed ?? 0
      },
      createdAt: vs.created_at
    }));

    return {
      output: { vectorStores },
      message: `Found **${vectorStores.length}** vector store(s).`
    };
  })
  .build();

export let searchVectorStore = SlateTool.create(spec, {
  name: 'Search Vector Store',
  key: 'search_vector_store',
  description: `Search a vector store using natural language queries. Returns ranked results with relevance scores. Supports configurable result limits and score thresholds.`,
  tags: {
    readOnly: true,
    destructive: false
  }
})
  .input(
    z.object({
      vectorStoreId: z.string().describe('Vector store ID to search'),
      query: z.string().describe('Natural language search query'),
      maxResults: z.number().optional().describe('Maximum number of results to return'),
      scoreThreshold: z
        .number()
        .optional()
        .describe('Minimum relevance score threshold (0-1)'),
      ranker: z.string().optional().describe('Ranking algorithm to use'),
      filters: z.any().optional().describe('Metadata filters for narrowing results')
    })
  )
  .output(
    z.object({
      results: z
        .array(
          z.object({
            fileId: z.string().describe('File ID the result comes from'),
            filename: z.string().describe('File name'),
            score: z.number().describe('Relevance score'),
            content: z
              .array(
                z.object({
                  type: z.string().describe('Content type'),
                  text: z.string().optional().describe('Text content')
                })
              )
              .describe('Matched content chunks')
          })
        )
        .describe('Search results ranked by relevance')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx);

    let rankingOptions: any = undefined;
    if (ctx.input.scoreThreshold !== undefined || ctx.input.ranker !== undefined) {
      rankingOptions = {};
      if (ctx.input.ranker !== undefined) rankingOptions.ranker = ctx.input.ranker;
      if (ctx.input.scoreThreshold !== undefined)
        rankingOptions.score_threshold = ctx.input.scoreThreshold;
    }

    let result = await client.searchVectorStore(ctx.input.vectorStoreId, {
      query: ctx.input.query,
      maxResults: ctx.input.maxResults,
      filters: ctx.input.filters,
      rankingOptions
    });

    let results = (result.data ?? []).map((r: any) => ({
      fileId: r.file_id,
      filename: r.filename,
      score: r.score,
      content: (r.content ?? []).map((c: any) => ({
        type: c.type,
        text: c.text
      }))
    }));

    return {
      output: { results },
      message: `Found **${results.length}** result(s) for query "${ctx.input.query}".`
    };
  })
  .build();

export let deleteVectorStore = SlateTool.create(spec, {
  name: 'Delete Vector Store',
  key: 'delete_vector_store',
  description: `Delete a vector store by its ID. This permanently removes the store and its indexed data.`,
  tags: {
    readOnly: false,
    destructive: true
  }
})
  .input(
    z.object({
      vectorStoreId: z.string().describe('Vector store ID to delete')
    })
  )
  .output(
    z.object({
      vectorStoreId: z.string().describe('ID of the deleted vector store'),
      deleted: z.boolean().describe('Whether the store was successfully deleted')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx);
    let result = await client.deleteVectorStore(ctx.input.vectorStoreId);

    return {
      output: {
        vectorStoreId: result.id,
        deleted: result.deleted
      },
      message: `Deleted vector store **${result.id}**.`
    };
  })
  .build();
