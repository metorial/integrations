import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let templateStepSchema = z.object({
  stepId: z.number().nullable().describe('Step identifier'),
  uuid: z.string().describe('Unique step identifier'),
  title: z.string().describe('App name for this step'),
  slug: z.string().describe('URL-friendly identifier'),
  description: z.string().describe('Step description'),
  image: z.string().describe('App icon URL'),
  hexColor: z.string().describe('App brand color'),
  api: z.string().describe('API used in this step'),
  label: z.string().nullable().describe('Step label')
});

export let getZapTemplates = SlateTool.create(spec, {
  name: 'Get Zap Templates',
  key: 'get_zap_templates',
  description: `Retrieve pre-built Zap templates that demonstrate popular automation workflows. Templates can be filtered by apps to find relevant automations.
Use this to suggest popular automations to users or to discover common integration patterns.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      apps: z
        .string()
        .optional()
        .describe('Comma-separated list of Zapier app names to match templates against'),
      limit: z
        .number()
        .optional()
        .describe('Maximum templates to return (default: 5, max: 100)'),
      offset: z.number().optional().describe('Number of templates to skip')
    })
  )
  .output(
    z.object({
      templates: z.array(
        z.object({
          templateId: z.number().describe('Template identifier'),
          title: z.string().describe('Template title describing the automation'),
          slug: z.string().describe('URL-friendly identifier'),
          status: z.string().describe('Template status: draft or published'),
          descriptionPlain: z.string().describe('Plain text description'),
          url: z.string().describe('Template URL'),
          createUrl: z.string().describe('URL to create a Zap from this template'),
          steps: z.array(templateStepSchema).describe('Steps in this template')
        })
      )
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let templates = await client.getZapTemplates({
      apps: ctx.input.apps,
      limit: ctx.input.limit,
      offset: ctx.input.offset
    });

    let mapped = (Array.isArray(templates) ? templates : []).map(t => ({
      templateId: t.id,
      title: t.title,
      slug: t.slug,
      status: t.status,
      descriptionPlain: t.descriptionPlain || '',
      url: t.url,
      createUrl: t.createUrl,
      steps: (t.steps || []).map(s => ({
        stepId: s.id,
        uuid: s.uuid,
        title: s.title,
        slug: s.slug,
        description: s.description,
        image: s.image,
        hexColor: s.hexColor,
        api: s.api,
        label: s.label
      }))
    }));

    return {
      output: { templates: mapped },
      message: `Retrieved **${mapped.length}** Zap template(s)${ctx.input.apps ? ` for apps: ${ctx.input.apps}` : ''}.`
    };
  })
  .build();
