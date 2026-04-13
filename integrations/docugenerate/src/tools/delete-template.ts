import { SlateTool } from 'slates';
import { DocuGenerateClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let deleteTemplate = SlateTool.create(spec, {
  name: 'Delete Template',
  key: 'delete_template',
  description: `Permanently deletes a template and all its associated data. This action cannot be undone.`,
  tags: {
    destructive: true,
    readOnly: false
  }
})
  .input(
    z.object({
      templateId: z.string().describe('ID of the template to delete')
    })
  )
  .output(
    z.object({
      templateId: z.string().describe('ID of the deleted template')
    })
  )
  .handleInvocation(async ctx => {
    let client = new DocuGenerateClient({
      token: ctx.auth.token,
      region: ctx.config.region
    });

    await client.deleteTemplate(ctx.input.templateId);

    return {
      output: { templateId: ctx.input.templateId },
      message: `Deleted template **${ctx.input.templateId}**`
    };
  })
  .build();
