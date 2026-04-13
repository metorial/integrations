import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let extractDataTool = SlateTool.create(spec, {
  name: 'Extract Data',
  key: 'extract_data',
  description: `Use AI to extract structured data from one or more web pages. Provide a natural language prompt and/or a JSON schema to define the desired output structure.
Supports wildcard URLs (e.g., \`example.com/*\`) to extract data across an entire domain. Can optionally follow links outside the specified domain.`,
  instructions: [
    'Provide at least one URL and either a prompt describing what to extract, a JSON schema for the output structure, or both.',
    'For wildcard URLs like example.com/*, the extractor will find and process relevant pages automatically.',
    'The extraction runs asynchronously — use the returned extractId with the Get Extract Status tool to retrieve results.'
  ],
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      urls: z
        .array(z.string())
        .describe('URLs to extract data from. Supports wildcards like example.com/*'),
      prompt: z
        .string()
        .optional()
        .describe('Natural language description of what data to extract'),
      schema: z
        .record(z.string(), z.any())
        .optional()
        .describe('JSON schema defining the desired output structure'),
      enableWebSearch: z
        .boolean()
        .optional()
        .describe('Allow the extractor to follow links outside the specified domain'),
      showSources: z
        .boolean()
        .optional()
        .describe('Include source information in the response')
    })
  )
  .output(
    z.object({
      extractId: z
        .string()
        .describe('Unique ID for the extract job, use to check status and retrieve results')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.startExtract({
      urls: ctx.input.urls,
      prompt: ctx.input.prompt,
      schema: ctx.input.schema,
      enableWebSearch: ctx.input.enableWebSearch,
      showSources: ctx.input.showSources
    });

    return {
      output: {
        extractId: result.id
      },
      message: `Started extraction job \`${result.id}\` for ${ctx.input.urls.length} URL(s). Use the "Get Extract Status" tool to check progress and retrieve results.`
    };
  });
