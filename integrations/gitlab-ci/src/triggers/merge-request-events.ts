import { SlateTrigger } from 'slates';
import { spec } from '../spec';
import { createClient } from '../lib/helpers';
import { z } from 'zod';

export let mergeRequestEvents = SlateTrigger.create(spec, {
  name: 'Merge Request Events',
  key: 'merge_request_events',
  description:
    'Triggered on merge request actions (open, close, merge, update, approve, unapprove). Useful for tracking MR-related CI activity and triggering MR pipelines.'
})
  .input(
    z.object({
      eventType: z.string(),
      mergeRequestId: z.number(),
      payload: z.any()
    })
  )
  .output(
    z.object({
      mergeRequestId: z.number(),
      mergeRequestIid: z.number(),
      action: z.string(),
      state: z.string(),
      title: z.string(),
      sourceBranch: z.string(),
      targetBranch: z.string(),
      mergeStatus: z.string().optional(),
      draft: z.boolean().optional(),
      url: z.string().optional(),
      authorName: z.string().optional(),
      assigneeName: z.string().optional().nullable(),
      projectId: z.number().optional(),
      projectName: z.string().optional(),
      lastCommitSha: z.string().optional(),
      lastCommitMessage: z.string().optional()
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
        merge_requests_events: true,
        push_events: false,
        tag_push_events: false,
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
      if (eventHeader !== 'Merge Request Hook') {
        return { inputs: [] };
      }

      let data = (await ctx.request.json()) as any;
      let mr = data.object_attributes;

      return {
        inputs: [
          {
            eventType: `merge_request.${mr.action}`,
            mergeRequestId: mr.id,
            payload: data
          }
        ]
      };
    },

    handleEvent: async ctx => {
      let data = ctx.input.payload;
      let mr = data.object_attributes;

      return {
        type: ctx.input.eventType,
        id: `mr-${mr.id}-${mr.action}-${mr.updated_at || mr.created_at}`,
        output: {
          mergeRequestId: mr.id,
          mergeRequestIid: mr.iid,
          action: mr.action,
          state: mr.state,
          title: mr.title,
          sourceBranch: mr.source_branch,
          targetBranch: mr.target_branch,
          mergeStatus: mr.merge_status,
          draft: mr.draft || mr.work_in_progress,
          url: mr.url,
          authorName: data.user?.name || data.user?.username,
          assigneeName: data.assignees?.[0]?.name || data.assignees?.[0]?.username || null,
          projectId: data.project?.id,
          projectName: data.project?.name,
          lastCommitSha: mr.last_commit?.id,
          lastCommitMessage: mr.last_commit?.message
        }
      };
    }
  })
  .build();
