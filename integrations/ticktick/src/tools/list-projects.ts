import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { projectOutputSchema, mapProject } from '../lib/schemas';
import { z } from 'zod';

export let listProjects = SlateTool.create(spec, {
  name: 'List Projects',
  key: 'list_projects',
  description: `List all projects (task lists) in the user's TickTick account. Returns project details including name, color, view mode, and permission level.`,
  tags: {
    destructive: false,
    readOnly: true
  }
})
  .input(z.object({}))
  .output(
    z.object({
      projects: z.array(projectOutputSchema).describe('List of all projects'),
      totalCount: z.number().describe('Total number of projects')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let projects = await client.listProjects();

    return {
      output: {
        projects: projects.map(mapProject),
        totalCount: projects.length
      },
      message: `Found **${projects.length}** project(s).`
    };
  })
  .build();
