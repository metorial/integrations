import { SlateTool } from 'slates';
import { JiraClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let createFilterTool = SlateTool.create(spec, {
  name: 'Create Filter',
  key: 'create_filter',
  description: `Create a saved JQL filter in Jira. Filters can be used to quickly access frequently used search queries.`,
  tags: {
    readOnly: false
  }
})
  .input(
    z.object({
      name: z.string().describe('The filter name.'),
      jql: z.string().describe('The JQL query for this filter.'),
      description: z.string().optional().describe('Optional description of the filter.'),
      favourite: z
        .boolean()
        .optional()
        .default(false)
        .describe('Whether to mark the filter as a favourite.')
    })
  )
  .output(
    z.object({
      filterId: z.string().describe('The ID of the created filter.'),
      name: z.string().describe('The filter name.'),
      jql: z.string().describe('The JQL query.'),
      owner: z.string().optional().describe('Display name of the filter owner.')
    })
  )
  .handleInvocation(async ctx => {
    let client = new JiraClient({
      token: ctx.auth.token,
      cloudId: ctx.config.cloudId,
      refreshToken: ctx.auth.refreshToken
    });

    let filter = await client.createFilter({
      name: ctx.input.name,
      jql: ctx.input.jql,
      description: ctx.input.description,
      favourite: ctx.input.favourite
    });

    return {
      output: {
        filterId: filter.id,
        name: filter.name,
        jql: filter.jql,
        owner: filter.owner?.displayName
      },
      message: `Created filter **${filter.name}** (ID: ${filter.id}).`
    };
  })
  .build();

export let listFavouriteFiltersTool = SlateTool.create(spec, {
  name: 'List Favourite Filters',
  key: 'list_favourite_filters',
  description: `List the authenticated user's favourite saved JQL filters.`,
  tags: {
    readOnly: true
  }
})
  .input(z.object({}))
  .output(
    z.object({
      filters: z.array(
        z.object({
          filterId: z.string().describe('The filter ID.'),
          name: z.string().describe('The filter name.'),
          jql: z.string().describe('The JQL query.'),
          owner: z.string().optional().describe('Display name of the filter owner.'),
          favourite: z.boolean().describe('Whether the filter is a favourite.')
        })
      )
    })
  )
  .handleInvocation(async ctx => {
    let client = new JiraClient({
      token: ctx.auth.token,
      cloudId: ctx.config.cloudId,
      refreshToken: ctx.auth.refreshToken
    });

    let filters = await client.getFavouriteFilters();

    return {
      output: {
        filters: filters.map((f: any) => ({
          filterId: f.id,
          name: f.name,
          jql: f.jql,
          owner: f.owner?.displayName,
          favourite: f.favourite ?? true
        }))
      },
      message: `Found **${filters.length}** favourite filters.`
    };
  })
  .build();
