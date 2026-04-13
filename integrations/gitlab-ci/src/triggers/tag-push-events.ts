import { SlateTrigger } from 'slates';
import { spec } from '../spec';
import { createClient } from '../lib/helpers';
import { z } from 'zod';

export let tagPushEvents = SlateTrigger.create(
  spec,
  {
    name: 'Tag Push Events',
    key: 'tag_push_events',
    description: 'Triggered when tags are created or deleted, often used to trigger release pipelines. Includes tag name, commit details, and project information.'
  }
)
  .input(z.object({
    eventType: z.string(),
    eventId: z.string(),
    payload: z.any()
  }))
  .output(z.object({
    ref: z.string(),
    tagName: z.string(),
    beforeSha: z.string(),
    afterSha: z.string(),
    checkoutSha: z.string().optional().nullable(),
    isNew: z.boolean(),
    isDeleted: z.boolean(),
    userName: z.string().optional(),
    userEmail: z.string().optional(),
    projectId: z.number().optional(),
    projectName: z.string().optional(),
    projectWebUrl: z.string().optional(),
    commits: z.array(z.object({
      commitId: z.string(),
      message: z.string(),
      title: z.string().optional(),
      timestamp: z.string().optional(),
      authorName: z.string().optional(),
      url: z.string().optional()
    })).optional()
  }))
  .webhook({
    autoRegisterWebhook: async (ctx) => {
      let client = createClient(ctx.auth, ctx.config);
      let projectId = ctx.config.projectId;
      if (!projectId) throw new Error('projectId is required in config for webhook registration');

      let webhook = await client.createProjectWebhook(projectId, {
        url: ctx.input.webhookBaseUrl,
        tag_push_events: true,
        push_events: false,
        merge_requests_events: false,
        pipeline_events: false,
        job_events: false,
        deployment_events: false,
        releases_events: false,
        enable_ssl_verification: true
      }) as any;

      return {
        registrationDetails: {
          hookId: webhook.id,
          projectId
        }
      };
    },

    autoUnregisterWebhook: async (ctx) => {
      let client = createClient(ctx.auth, ctx.config);
      let { hookId, projectId } = ctx.input.registrationDetails as { hookId: number; projectId: string };
      await client.deleteProjectWebhook(projectId, hookId);
    },

    handleRequest: async (ctx) => {
      let eventHeader = ctx.request.headers.get('x-gitlab-event');
      if (eventHeader !== 'Tag Push Hook') {
        return { inputs: [] };
      }

      let data = await ctx.request.json() as any;
      let isNew = data.before === '0000000000000000000000000000000000000000';
      let isDeleted = data.after === '0000000000000000000000000000000000000000';
      let action = isDeleted ? 'deleted' : isNew ? 'created' : 'updated';

      return {
        inputs: [{
          eventType: `tag.${action}`,
          eventId: `tag-${data.checkout_sha || data.after}-${data.project_id}-${action}`,
          payload: data
        }]
      };
    },

    handleEvent: async (ctx) => {
      let data = ctx.input.payload;
      let ref = data.ref || '';
      let tagName = ref.replace(/^refs\/tags\//, '');
      let zeroed = '0000000000000000000000000000000000000000';
      let isNew = data.before === zeroed;
      let isDeleted = data.after === zeroed;

      let commits = (data.commits || []).map((c: any) => ({
        commitId: c.id,
        message: c.message,
        title: c.title,
        timestamp: c.timestamp,
        authorName: c.author?.name,
        url: c.url
      }));

      return {
        type: ctx.input.eventType,
        id: ctx.input.eventId,
        output: {
          ref: data.ref,
          tagName,
          beforeSha: data.before,
          afterSha: data.after,
          checkoutSha: data.checkout_sha,
          isNew,
          isDeleted,
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
