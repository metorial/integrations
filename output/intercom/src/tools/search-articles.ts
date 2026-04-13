import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let searchArticles = SlateTool.create(
  spec,
  {
    name: 'Search Articles',
    key: 'search_articles',
    description: `Search help center articles by phrase or list all articles with pagination. Search results include highlighted matching snippets.`,
    instructions: [
      'Use "search" mode with a phrase to find articles by content.',
      'Use "list" mode to browse all articles with pagination.'
    ],
    tags: {
      readOnly: true
    }
  }
)
  .input(z.object({
    mode: z.enum(['search', 'list']).default('list').describe('Whether to search by phrase or list all articles'),
    phrase: z.string().optional().describe('Search phrase (required for search mode)'),
    helpCenterId: z.string().optional().describe('Filter to a specific help center'),
    state: z.enum(['published', 'draft']).optional().describe('Filter by article state'),
    page: z.number().optional().describe('Page number (for list mode)'),
    perPage: z.number().optional().describe('Results per page')
  }))
  .output(z.object({
    articles: z.array(z.object({
      articleId: z.string().describe('Article ID'),
      title: z.string().optional().describe('Article title'),
      description: z.string().optional().describe('Article description'),
      state: z.string().optional().describe('Article state'),
      url: z.string().optional().describe('Article URL'),
      authorId: z.string().optional().describe('Author admin ID'),
      parentId: z.string().optional().describe('Parent collection/section ID'),
      createdAt: z.string().optional().describe('Creation timestamp'),
      updatedAt: z.string().optional().describe('Last update timestamp')
    })).describe('Matching articles'),
    totalCount: z.number().optional().describe('Total number of articles'),
    hasMore: z.boolean().describe('Whether more results are available')
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token, region: ctx.config.region });

    let result: any;
    if (ctx.input.mode === 'search' && ctx.input.phrase) {
      result = await client.searchArticles(ctx.input.phrase, ctx.input.helpCenterId, undefined, ctx.input.state);
    } else {
      result = await client.listArticles({ page: ctx.input.page, perPage: ctx.input.perPage });
    }

    let articles = (result.data || []).map((a: any) => ({
      articleId: a.id,
      title: a.title,
      description: a.description,
      state: a.state,
      url: a.url,
      authorId: a.author_id ? String(a.author_id) : undefined,
      parentId: a.parent_id ? String(a.parent_id) : undefined,
      createdAt: a.created_at ? String(a.created_at) : undefined,
      updatedAt: a.updated_at ? String(a.updated_at) : undefined
    }));

    return {
      output: {
        articles,
        totalCount: result.total_count,
        hasMore: !!(result.pages?.next || result.total_count > articles.length)
      },
      message: `Found **${result.total_count ?? articles.length}** articles (showing ${articles.length})`
    };
  }).build();
