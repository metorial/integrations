import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageR2BucketsTool = SlateTool.create(spec, {
  name: 'Manage R2 Buckets',
  key: 'manage_r2_buckets',
  description: `List, create, get details, or delete R2 object storage buckets. R2 is Cloudflare's S3-compatible object storage with zero egress fees.`,
  tags: {
    destructive: true
  }
})
  .input(
    z.object({
      action: z.enum(['list', 'create', 'get', 'delete']).describe('Operation to perform'),
      accountId: z.string().optional().describe('Account ID (uses config if not provided)'),
      bucketName: z
        .string()
        .optional()
        .describe('Bucket name (required for create, get, delete)'),
      locationHint: z
        .string()
        .optional()
        .describe('Location hint for bucket creation (e.g. wnam, enam, weur, eeur, apac)')
    })
  )
  .output(
    z.object({
      buckets: z
        .array(
          z.object({
            name: z.string(),
            creationDate: z.string().optional(),
            location: z.string().optional()
          })
        )
        .optional(),
      bucket: z
        .object({
          name: z.string(),
          creationDate: z.string().optional(),
          location: z.string().optional()
        })
        .optional(),
      deleted: z.boolean().optional()
    })
  )
  .handleInvocation(async ctx => {
    let accountId = ctx.input.accountId || ctx.config.accountId;
    if (!accountId) throw new Error('accountId is required');

    let client = new Client(ctx.auth);
    let { action } = ctx.input;

    if (action === 'list') {
      let response = await client.listR2Buckets(accountId);
      let bucketList = response.result?.buckets || response.result || [];
      let buckets = (Array.isArray(bucketList) ? bucketList : []).map((b: any) => ({
        name: b.name,
        creationDate: b.creation_date,
        location: b.location
      }));
      return {
        output: { buckets },
        message: `Found **${buckets.length}** R2 bucket(s).`
      };
    }

    if (action === 'create') {
      if (!ctx.input.bucketName) throw new Error('bucketName is required');
      await client.createR2Bucket(accountId, ctx.input.bucketName, ctx.input.locationHint);
      return {
        output: { bucket: { name: ctx.input.bucketName, location: ctx.input.locationHint } },
        message: `Created R2 bucket **${ctx.input.bucketName}**.`
      };
    }

    if (action === 'get') {
      if (!ctx.input.bucketName) throw new Error('bucketName is required');
      let response = await client.getR2Bucket(accountId, ctx.input.bucketName);
      let b = response.result;
      return {
        output: {
          bucket: {
            name: b.name,
            creationDate: b.creation_date,
            location: b.location
          }
        },
        message: `R2 bucket **${b.name}** — Location: ${b.location || 'auto'}`
      };
    }

    if (action === 'delete') {
      if (!ctx.input.bucketName) throw new Error('bucketName is required');
      await client.deleteR2Bucket(accountId, ctx.input.bucketName);
      return {
        output: { deleted: true },
        message: `Deleted R2 bucket **${ctx.input.bucketName}**.`
      };
    }

    throw new Error(`Unknown action: ${action}`);
  })
  .build();
