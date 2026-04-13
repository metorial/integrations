import { SlateTool } from 'slates';
import { spec } from '../spec';
import { createClient } from '../lib/helpers';
import { z } from 'zod';

export let getLabels = SlateTool.create(spec, {
  name: 'Get Labels',
  key: 'get_labels',
  description: `Get all labels on a Confluence content item (page, blog post, or attachment).`,
  tags: { readOnly: true }
})
  .input(z.object({
    contentId: z.string().describe('The content ID (page, blog post, or attachment)')
  }))
  .output(z.object({
    labels: z.array(z.object({
      name: z.string(),
      prefix: z.string()
    }))
  }))
  .handleInvocation(async (ctx) => {
    let client = createClient(ctx.auth, ctx.config);
    let response = await client.getContentLabels(ctx.input.contentId);

    let labels = response.results.map(l => ({
      name: l.name,
      prefix: l.prefix
    }));

    return {
      output: { labels },
      message: `Found **${labels.length}** labels on content ${ctx.input.contentId}`
    };
  })
  .build();

export let addLabels = SlateTool.create(spec, {
  name: 'Add Labels',
  key: 'add_labels',
  description: `Add one or more labels to a Confluence content item (page, blog post, or attachment). Labels are useful for categorization and discovery.`,
  tags: { destructive: false }
})
  .input(z.object({
    contentId: z.string().describe('The content ID to add labels to'),
    labels: z.array(z.string()).min(1).describe('Label names to add')
  }))
  .output(z.object({
    addedLabels: z.array(z.object({
      name: z.string(),
      prefix: z.string()
    }))
  }))
  .handleInvocation(async (ctx) => {
    let client = createClient(ctx.auth, ctx.config);
    let result = await client.addContentLabels(ctx.input.contentId, ctx.input.labels);

    let addedLabels = result.map(l => ({ name: l.name, prefix: l.prefix }));

    return {
      output: { addedLabels },
      message: `Added labels **${ctx.input.labels.join(', ')}** to content ${ctx.input.contentId}`
    };
  })
  .build();

export let removeLabel = SlateTool.create(spec, {
  name: 'Remove Label',
  key: 'remove_label',
  description: `Remove a label from a Confluence content item.`,
  tags: { destructive: true }
})
  .input(z.object({
    contentId: z.string().describe('The content ID to remove the label from'),
    label: z.string().describe('The label name to remove')
  }))
  .output(z.object({
    removed: z.boolean()
  }))
  .handleInvocation(async (ctx) => {
    let client = createClient(ctx.auth, ctx.config);
    await client.removeContentLabel(ctx.input.contentId, ctx.input.label);

    return {
      output: { removed: true },
      message: `Removed label **${ctx.input.label}** from content ${ctx.input.contentId}`
    };
  })
  .build();
