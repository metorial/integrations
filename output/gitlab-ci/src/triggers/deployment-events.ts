import { SlateTrigger } from 'slates';
import { spec } from '../spec';
import { createClient } from '../lib/helpers';
import { z } from 'zod';

export let deploymentEvents = SlateTrigger.create(
  spec,
  {
    name: 'Deployment Events',
    key: 'deployment_events',
    description: 'Triggered when a deployment is created, updated, or completed. Includes deployment details, environment info, and the associated CI/CD job.'
  }
)
  .input(z.object({
    eventType: z.string(),
    deploymentId: z.number(),
    payload: z.any()
  }))
  .output(z.object({
    deploymentId: z.number(),
    status: z.string(),
    statusChangedAt: z.string().optional(),
    environmentName: z.string().optional(),
    environmentTier: z.string().optional(),
    environmentExternalUrl: z.string().optional(),
    deployableId: z.number().optional().nullable(),
    deployableUrl: z.string().optional().nullable(),
    ref: z.string().optional(),
    sha: z.string().optional(),
    commitTitle: z.string().optional(),
    userName: z.string().optional(),
    projectId: z.number().optional(),
    projectName: z.string().optional(),
    projectWebUrl: z.string().optional()
  }))
  .webhook({
    autoRegisterWebhook: async (ctx) => {
      let client = createClient(ctx.auth, ctx.config);
      let projectId = ctx.config.projectId;
      if (!projectId) throw new Error('projectId is required in config for webhook registration');

      let webhook = await client.createProjectWebhook(projectId, {
        url: ctx.input.webhookBaseUrl,
        deployment_events: true,
        push_events: false,
        tag_push_events: false,
        merge_requests_events: false,
        pipeline_events: false,
        job_events: false,
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
      if (eventHeader !== 'Deployment Hook') {
        return { inputs: [] };
      }

      let data = await ctx.request.json() as any;

      return {
        inputs: [{
          eventType: `deployment.${data.status}`,
          deploymentId: data.deployment_id,
          payload: data
        }]
      };
    },

    handleEvent: async (ctx) => {
      let data = ctx.input.payload;

      return {
        type: ctx.input.eventType,
        id: `deployment-${data.deployment_id}-${data.status}`,
        output: {
          deploymentId: data.deployment_id,
          status: data.status,
          statusChangedAt: data.status_changed_at,
          environmentName: data.environment,
          environmentTier: data.environment_tier,
          environmentExternalUrl: data.environment_external_url,
          deployableId: data.deployable_id,
          deployableUrl: data.deployable_url,
          ref: data.ref,
          sha: data.short_sha || data.sha,
          commitTitle: data.commit_title,
          userName: data.user?.name || data.user?.username,
          projectId: data.project?.id,
          projectName: data.project?.name,
          projectWebUrl: data.project?.web_url
        }
      };
    }
  })
  .build();
