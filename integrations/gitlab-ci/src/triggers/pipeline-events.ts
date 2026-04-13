import { SlateTrigger } from 'slates';
import { spec } from '../spec';
import { createClient } from '../lib/helpers';
import { z } from 'zod';

export let pipelineEvents = SlateTrigger.create(spec, {
  name: 'Pipeline Events',
  key: 'pipeline_events',
  description:
    'Triggered when a pipeline status changes (e.g. pending, running, success, failed, canceled). Includes pipeline details, project info, commit data, and job list.'
})
  .input(
    z.object({
      eventType: z.string(),
      pipelineId: z.number(),
      payload: z.any()
    })
  )
  .output(
    z.object({
      pipelineId: z.number(),
      status: z.string(),
      ref: z.string(),
      sha: z.string().optional(),
      source: z.string().optional(),
      tag: z.boolean().optional(),
      duration: z.number().optional().nullable(),
      queuedDuration: z.number().optional().nullable(),
      createdAt: z.string().optional(),
      finishedAt: z.string().optional().nullable(),
      name: z.string().optional().nullable(),
      stages: z.array(z.string()).optional(),
      projectId: z.number().optional(),
      projectName: z.string().optional(),
      projectWebUrl: z.string().optional(),
      userName: z.string().optional(),
      commitMessage: z.string().optional(),
      commitAuthor: z.string().optional(),
      jobs: z
        .array(
          z.object({
            jobId: z.number(),
            name: z.string(),
            stage: z.string(),
            status: z.string(),
            duration: z.number().optional().nullable(),
            allowFailure: z.boolean().optional(),
            failureReason: z.string().optional().nullable()
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
        pipeline_events: true,
        push_events: false,
        tag_push_events: false,
        merge_requests_events: false,
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
      if (eventHeader !== 'Pipeline Hook') {
        return { inputs: [] };
      }

      let data = (await ctx.request.json()) as any;
      let pipeline = data.object_attributes;

      return {
        inputs: [
          {
            eventType: `pipeline.${pipeline.status}`,
            pipelineId: pipeline.id,
            payload: data
          }
        ]
      };
    },

    handleEvent: async ctx => {
      let data = ctx.input.payload;
      let pipeline = data.object_attributes;

      let jobs = (data.builds || []).map((b: any) => ({
        jobId: b.id,
        name: b.name,
        stage: b.stage,
        status: b.status,
        duration: b.duration,
        allowFailure: b.allow_failure,
        failureReason: b.failure_reason
      }));

      return {
        type: ctx.input.eventType,
        id: `pipeline-${pipeline.id}-${pipeline.status}`,
        output: {
          pipelineId: pipeline.id,
          status: pipeline.status,
          ref: pipeline.ref,
          sha: pipeline.sha,
          source: pipeline.source,
          tag: pipeline.tag,
          duration: pipeline.duration,
          queuedDuration: pipeline.queued_duration,
          createdAt: pipeline.created_at,
          finishedAt: pipeline.finished_at,
          name: data.commit?.name || pipeline.name,
          stages: pipeline.stages,
          projectId: data.project?.id,
          projectName: data.project?.name,
          projectWebUrl: data.project?.web_url,
          userName: data.user?.name || data.user?.username,
          commitMessage: data.commit?.message,
          commitAuthor: data.commit?.author?.name,
          jobs
        }
      };
    }
  })
  .build();
