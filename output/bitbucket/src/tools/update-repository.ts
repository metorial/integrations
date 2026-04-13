import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let updateRepositoryTool = SlateTool.create(
  spec,
  {
    name: 'Update Repository',
    key: 'update_repository',
    description: `Update repository settings such as name, description, privacy, language, fork policy, project assignment, and issue/wiki toggles.`,
  }
)
  .input(z.object({
    repoSlug: z.string().describe('Repository slug to update'),
    name: z.string().optional().describe('New display name'),
    description: z.string().optional().describe('New description'),
    isPrivate: z.boolean().optional().describe('Set repository privacy'),
    language: z.string().optional().describe('Primary programming language'),
    projectKey: z.string().optional().describe('Move repository to a different project'),
    forkPolicy: z.enum(['allow_forks', 'no_public_forks', 'no_forks']).optional().describe('Fork policy'),
    hasIssues: z.boolean().optional().describe('Enable or disable the issue tracker'),
    hasWiki: z.boolean().optional().describe('Enable or disable the wiki'),
  }))
  .output(z.object({
    repoSlug: z.string(),
    fullName: z.string(),
    htmlUrl: z.string().optional(),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token, workspace: ctx.config.workspace });

    let body: Record<string, any> = {};
    if (ctx.input.name) body.name = ctx.input.name;
    if (ctx.input.description !== undefined) body.description = ctx.input.description;
    if (ctx.input.isPrivate !== undefined) body.is_private = ctx.input.isPrivate;
    if (ctx.input.language) body.language = ctx.input.language;
    if (ctx.input.projectKey) body.project = { key: ctx.input.projectKey };
    if (ctx.input.forkPolicy) body.fork_policy = ctx.input.forkPolicy;
    if (ctx.input.hasIssues !== undefined) body.has_issues = ctx.input.hasIssues;
    if (ctx.input.hasWiki !== undefined) body.has_wiki = ctx.input.hasWiki;

    let r = await client.updateRepository(ctx.input.repoSlug, body);

    return {
      output: {
        repoSlug: r.slug,
        fullName: r.full_name,
        htmlUrl: r.links?.html?.href || undefined,
      },
      message: `Updated repository **${r.full_name}**.`,
    };
  }).build();
