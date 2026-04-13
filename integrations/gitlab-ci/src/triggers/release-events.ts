import { SlateTrigger } from 'slates';
import { spec } from '../spec';
import { createClient } from '../lib/helpers';
import { z } from 'zod';

export let releaseEvents = SlateTrigger.create(
  spec,
  {
    name: 'Release Events',
    key: 'release_events',
    description: 'Triggered when a release is created or updated in a project. Includes release details such as tag, name, description, and asset links.'
  }
)
  .input(z.object({
    eventType: z.string(),
    releaseTag: z.string(),
    payload: z.any()
  }))
  .output(z.object({
    releaseId: z.number().optional(),
    tag: z.string(),
    name: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    action: z.string(),
    createdAt: z.string().optional(),
    releasedAt: z.string().optional(),
    url: z.string().optional(),
    projectId: z.number().optional(),
    projectName: z.string().optional(),
    projectWebUrl: z.string().optional(),
    commitSha: z.string().optional(),
    commitTitle: z.string().optional(),
    assets: z.object({
      count: z.number().optional(),
      links: z.array(z.object({
        linkId: z.number().optional(),
        name: z.string(),
        url: z.string(),
        linkType: z.string().optional()
      })).optional()
    }).optional()
  }))
  .webhook({
    autoRegisterWebhook: async (ctx) => {
      let client = createClient(ctx.auth, ctx.config);
      let projectId = ctx.config.projectId;
      if (!projectId) throw new Error('projectId is required in config for webhook registration');

      let webhook = await client.createProjectWebhook(projectId, {
        url: ctx.input.webhookBaseUrl,
        releases_events: true,
        push_events: false,
        tag_push_events: false,
        merge_requests_events: false,
        pipeline_events: false,
        job_events: false,
        deployment_events: false,
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
      if (eventHeader !== 'Release Hook') {
        return { inputs: [] };
      }

      let data = await ctx.request.json() as any;

      return {
        inputs: [{
          eventType: `release.${data.action}`,
          releaseTag: data.tag,
          payload: data
        }]
      };
    },

    handleEvent: async (ctx) => {
      let data = ctx.input.payload;

      let assetLinks = (data.assets?.links || []).map((l: any) => ({
        linkId: l.id,
        name: l.name,
        url: l.url,
        linkType: l.link_type
      }));

      return {
        type: ctx.input.eventType,
        id: `release-${data.tag}-${data.action}`,
        output: {
          releaseId: data.id,
          tag: data.tag,
          name: data.name,
          description: data.description,
          action: data.action,
          createdAt: data.created_at,
          releasedAt: data.released_at,
          url: data.url,
          projectId: data.project?.id,
          projectName: data.project?.name,
          projectWebUrl: data.project?.web_url,
          commitSha: data.commit?.id,
          commitTitle: data.commit?.title,
          assets: {
            count: data.assets?.count,
            links: assetLinks
          }
        }
      };
    }
  })
  .build();
