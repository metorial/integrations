import { SlateTrigger } from 'slates';
import { spec } from '../spec';
import { createClient } from '../lib/helpers';
import { z } from 'zod';

export let jobEvents = SlateTrigger.create(spec, {
  name: 'Job Events',
  key: 'job_events',
  description:
    'Triggered when a CI/CD job status changes (e.g. created, pending, running, success, failed). Includes job details, stage, runner info, and associated pipeline/project.'
})
  .input(
    z.object({
      eventType: z.string(),
      jobId: z.number(),
      payload: z.any()
    })
  )
  .output(
    z.object({
      jobId: z.number(),
      name: z.string(),
      stage: z.string(),
      status: z.string(),
      ref: z.string().optional(),
      tag: z.boolean().optional(),
      duration: z.number().optional().nullable(),
      queuedDuration: z.number().optional().nullable(),
      startedAt: z.string().optional().nullable(),
      finishedAt: z.string().optional().nullable(),
      createdAt: z.string().optional(),
      allowFailure: z.boolean().optional(),
      failureReason: z.string().optional().nullable(),
      retriesCount: z.number().optional(),
      pipelineId: z.number().optional(),
      projectId: z.number().optional(),
      projectName: z.string().optional(),
      runnerDescription: z.string().optional().nullable(),
      userName: z.string().optional(),
      commitSha: z.string().optional(),
      commitMessage: z.string().optional()
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
        job_events: true,
        push_events: false,
        tag_push_events: false,
        merge_requests_events: false,
        pipeline_events: false,
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
      if (eventHeader !== 'Job Hook') {
        return { inputs: [] };
      }

      let data = (await ctx.request.json()) as any;

      return {
        inputs: [
          {
            eventType: `job.${data.build_status}`,
            jobId: data.build_id,
            payload: data
          }
        ]
      };
    },

    handleEvent: async ctx => {
      let data = ctx.input.payload;

      return {
        type: ctx.input.eventType,
        id: `job-${data.build_id}-${data.build_status}`,
        output: {
          jobId: data.build_id,
          name: data.build_name,
          stage: data.build_stage,
          status: data.build_status,
          ref: data.ref,
          tag: data.tag,
          duration: data.build_duration,
          queuedDuration: data.build_queued_duration,
          startedAt: data.build_started_at,
          finishedAt: data.build_finished_at,
          createdAt: data.build_created_at,
          allowFailure: data.build_allow_failure,
          failureReason: data.build_failure_reason,
          retriesCount: data.retries_count,
          pipelineId: data.pipeline_id,
          projectId: data.project_id,
          projectName: data.project_name,
          runnerDescription: data.runner?.description,
          userName: data.user?.name || data.user?.username,
          commitSha: data.sha,
          commitMessage: data.commit?.message
        }
      };
    }
  })
  .build();
