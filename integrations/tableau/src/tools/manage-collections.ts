import { SlateTool } from 'slates';
import { z } from 'zod';
import { spec } from '../spec';
import { createClient } from '../lib/helpers';

export let manageCollections = SlateTool.create(spec, {
  name: 'Manage Collections',
  key: 'manage_collections',
  description: `List, create, update, or delete collections. Collections are curated groups of content items for organizational purposes.`
})
  .input(
    z.object({
      action: z.enum(['list', 'create', 'update', 'delete']).describe('Operation to perform'),
      collectionId: z
        .string()
        .optional()
        .describe('Collection LUID (required for update, delete)'),
      name: z.string().optional().describe('Collection name (required for create)'),
      description: z.string().optional().describe('Collection description'),
      pageSize: z.number().optional().describe('Page size for list'),
      pageNumber: z.number().optional().describe('Page number for list')
    })
  )
  .output(
    z.object({
      collections: z
        .array(
          z.object({
            collectionId: z.string(),
            name: z.string().optional(),
            description: z.string().optional()
          })
        )
        .optional(),
      collection: z
        .object({
          collectionId: z.string(),
          name: z.string().optional(),
          description: z.string().optional()
        })
        .optional(),
      totalCount: z.number().optional(),
      deleted: z.boolean().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx.config, ctx.auth);
    let { action } = ctx.input;

    if (action === 'list') {
      let result = await client.queryCollections({
        pageSize: ctx.input.pageSize,
        pageNumber: ctx.input.pageNumber
      });
      let pagination = result.pagination || {};
      let collections = (result.collections?.collection || []).map((c: any) => ({
        collectionId: c.id,
        name: c.name,
        description: c.description
      }));
      return {
        output: { collections, totalCount: Number(pagination.totalAvailable || 0) },
        message: `Found **${collections.length}** collections.`
      };
    }

    if (action === 'create') {
      let c = await client.createCollection(ctx.input.name!, ctx.input.description);
      return {
        output: {
          collection: { collectionId: c.id, name: c.name, description: c.description }
        },
        message: `Created collection **${c.name}**.`
      };
    }

    if (action === 'update') {
      let c = await client.updateCollection(ctx.input.collectionId!, {
        name: ctx.input.name,
        description: ctx.input.description
      });
      return {
        output: {
          collection: { collectionId: c.id, name: c.name, description: c.description }
        },
        message: `Updated collection **${c.name}**.`
      };
    }

    if (action === 'delete') {
      await client.deleteCollection(ctx.input.collectionId!);
      return {
        output: { deleted: true },
        message: `Deleted collection \`${ctx.input.collectionId}\`.`
      };
    }

    return { output: {}, message: `Unknown action: ${action}` };
  })
  .build();
