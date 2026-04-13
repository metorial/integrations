import { SlateTrigger } from 'slates';
import { spec } from '../spec';
import { createClient } from '../lib/helpers';
import { z } from 'zod';

export let pushEvents = SlateTrigger.create(spec, {
  name: 'Push Events',
  key: 'push_events',
  description:
    'Triggered when code is pushed to the repository, which typically triggers CI/CD pipelines. Includes commit details, branch/ref information, and before/after SHAs.'
})
  .input(
    z.object({
      eventType: z.string(),
      eventId: z.string(),
      payload: z.any()
    })
  )
  .output(
    z.object({
      ref: z.string(),
      beforeSha: z.string(),
      afterSha: z.string(),
      checkoutSha: z.string().optional().nullable(),
      branch: z.string(),
      totalCommitsCount: z.number(),
      userName: z.string().optional(),
      userEmail: z.string().optional(),
      projectId: z.number().optional(),
      projectName: z.string().optional(),
      projectWebUrl: z.string().optional(),
      commits: z
        .array(
          z.object({
            commitId: z.string(),
            message: z.string(),
            title: z.string().optional(),
            timestamp: z.string().optional(),
            authorName: z.string().optional(),
            authorEmail: z.string().optional(),
            url: z.string().optional(),
            added: z.array(z.string()).optional(),
            modified: z.array(z.string()).optional(),
            removed: z.array(z.string()).optional()
          })
        )
        .optional()
    })
  )
  .webhook({
    autoRegisterWebhook: async ctx => {
      let client = createClient(ctx.auth, ctx.config);
      let projectId = ctx.config.projectId;
      if (!projectId)
        throw new Error('projectId is required in config for webhook registration');

      let webhook = (await client.createProjectWebhook(projectId, {
        url: ctx.input.webhookBaseUrl,
        push_events: true,
        tag_push_events: false,
        merge_requests_events: false,
        pipeline_events: false,
        job_events: false,
        deployment_events: false,
        releases_events: false,
        enable_ssl_verification: true
      })) as any;

      return {
        registrationDetails: {
          hookId: webhook.id,
          projectId
        }
      };
    },

    autoUnregisterWebhook: async ctx => {
      let client = createClient(ctx.auth, ctx.config);
      let { hookId, projectId } = ctx.input.registrationDetails as {
        hookId: number;
        projectId: string;
      };
      await client.deleteProjectWebhook(projectId, hookId);
    },

    handleRequest: async ctx => {
      let eventHeader = ctx.request.headers.get('x-gitlab-event');
      if (eventHeader !== 'Push Hook') {
        return { inputs: [] };
      }

      let data = (await ctx.request.json()) as any;

      return {
        inputs: [
          {
            eventType: 'push',
            eventId: `push-${data.checkout_sha || data.after}-${data.project_id}`,
            payload: data
          }
        ]
      };
    },

    handleEvent: async ctx => {
      let data = ctx.input.payload;
      let ref = data.ref || '';
      let branch = ref.replace(/^refs\/heads\//, '');

      let commits = (data.commits || []).map((c: any) => ({
        commitId: c.id,
        message: c.message,
        title: c.title,
        timestamp: c.timestamp,
        authorName: c.author?.name,
        authorEmail: c.author?.email,
        url: c.url,
        added: c.added,
        modified: c.modified,
        removed: c.removed
      }));

      return {
        type: 'push',
        id: ctx.input.eventId,
        output: {
          ref: data.ref,
          beforeSha: data.before,
          afterSha: data.after,
          checkoutSha: data.checkout_sha,
          branch,
          totalCommitsCount: data.total_commits_count || commits.length,
          userName: data.user_name,
          userEmail: data.user_email,
          projectId: data.project?.id,
          projectName: data.project?.name,
          projectWebUrl: data.project?.web_url,
          commits
        }
      };
    }
  })
  .build();
