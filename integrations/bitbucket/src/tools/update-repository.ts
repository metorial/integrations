import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let updateRepositoryTool = SlateTool.create(spec, {
  name: 'Update Repository',
  key: 'update_repository',
  description: `Update repository settings (issue tracker, wiki, fork policy, project, privacy, language, name, description). Bitbucket's **PUT** replaces the repository resource — this tool **GETs the repo**, builds a full body from the current values, then applies only the fields you pass. Omit a field to leave it unchanged. If you only change **description**, still pass **name** when you rely on a known display title (match **get_repository** or the name used at **create_repository**), because the API may omit or normalize **name** on read.`
})
  .input(
    z.object({
      repoSlug: z.string().describe('Repository slug to update'),
      name: z
        .string()
        .optional()
        .describe(
          'Display name to set. When changing other fields, include the current or intended name if you need a stable value (see tool description).'
        ),
      description: z.string().optional().describe('New description'),
      isPrivate: z.boolean().optional().describe('Set repository privacy'),
      language: z.string().optional().describe('Primary programming language'),
      projectKey: z.string().optional().describe('Move repository to a different project'),
      forkPolicy: z
        .enum(['allow_forks', 'no_public_forks', 'no_forks'])
        .optional()
        .describe('Fork policy'),
      hasIssues: z.boolean().optional().describe('Enable or disable the issue tracker'),
      hasWiki: z.boolean().optional().describe('Enable or disable the wiki')
    })
  )
  .output(
    z.object({
      repoSlug: z.string(),
      fullName: z.string(),
      htmlUrl: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token, workspace: ctx.config.workspace });
    let slug = ctx.input.repoSlug;

    let cur = await client.getRepository(slug);

    // Start from the live repository. Bitbucket's GET payload sometimes omits or
    // normalizes `name`; PUT still needs a display name, so fall back to the slug.
    let body: Record<string, any> = {
      scm: cur.scm ?? 'git',
      name: typeof cur.name === 'string' && cur.name.trim() !== '' ? cur.name : slug,
      description: cur.description ?? '',
      is_private: cur.is_private,
      fork_policy: cur.fork_policy,
      has_issues: cur.has_issues,
      has_wiki: cur.has_wiki
    };
    if (cur.language != null && cur.language !== '') {
      body.language = cur.language;
    }
    if (cur.project?.key) {
      body.project = { key: cur.project.key };
    }

    if (ctx.input.name !== undefined) {
      body.name = ctx.input.name;
    }
    if (ctx.input.description !== undefined) {
      body.description = ctx.input.description;
    }
    if (ctx.input.isPrivate !== undefined) {
      body.is_private = ctx.input.isPrivate;
    }
    if (ctx.input.language !== undefined) {
      body.language = ctx.input.language;
    }
    if (ctx.input.projectKey) {
      body.project = { key: ctx.input.projectKey };
    }
    if (ctx.input.forkPolicy !== undefined) {
      body.fork_policy = ctx.input.forkPolicy;
    }
    if (ctx.input.hasIssues !== undefined) {
      body.has_issues = ctx.input.hasIssues;
    }
    if (ctx.input.hasWiki !== undefined) {
      body.has_wiki = ctx.input.hasWiki;
    }

    let r = await client.updateRepository(slug, body);

    return {
      output: {
        repoSlug: r.slug,
        fullName: r.full_name,
        htmlUrl: r.links?.html?.href || undefined
      },
      message: `Updated repository **${r.full_name}**.`
    };
  })
  .build();
